import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, PerformanceMonitor, useGLTF } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ACESFilmicToneMapping, AgXToneMapping, AnimationMixer, CanvasTexture, CatmullRomCurve3, Color, LinearFilter, LinearMipmapLinearFilter, LoopOnce, MathUtils, Matrix4, MeshPhysicalMaterial, MeshStandardMaterial, NeutralToneMapping, NoToneMapping, Quaternion, RepeatWrapping, SRGBColorSpace, Vector2, Vector3 } from 'three'

// Personaggio seduto alla scrivania: testa che segue il mouse, mani che battono, camera legata allo scroll.
// La scena resta ferma sullo schermo dalla hero (viso in primo piano) a "Cosa faccio" (campo lungo sulla scrivania).
// I modelli stanno in frontend/public/models. Unita' in metri, Y in alto, il personaggio guarda verso +Z.
const CHARACTER_URL = '/models/character.glb?v=5' // ?v=5: il browser non riusa la versione precedente del modello
const DESK_URL = '/models/desk-set.glb'

// Scarica e interpreta i modelli appena questo modulo viene caricato (App.jsx lo carica subito, mentre c'e' il PLAY)
useGLTF.preload(CHARACTER_URL)
useGLTF.preload(DESK_URL)

const deg = MathUtils.degToRad
const X = new Vector3(1, 0, 0)
const Z = new Vector3(0, 0, 1)
const Y = new Vector3(0, 1, 0)

/* ---------- Look della scena: tutti i valori di luci, materiali e post-processing sono qui ---------- */
const LOOK = {
  // Ambiente quasi nullo: vale sia per la luce ambiente sia per i riflessi (HDRI generato in locale)
  ambient: 0.15,
  // Luce principale: neutra/calda (mai rosa), davanti e in alto, un po' a destra. Scende dal primo piano (near) al campo lungo (far)
  key: { color: '#fff0e2', near: 1.5, far: 0.9, offset: [0.8, 1.3, 1.8] }, // meno satura e piu' gialla di prima (#ffe2cf): meno salmone
  // Riempimento debole davanti, neutro: il viso non resta mai al buio
  fill: { color: '#ffeedd', near: 0.3, far: 0.1, offset: [-0.25, -0.2, 1.0], distance: 4 },
  // Controluci: SOLO da dietro (z negativa), disegnano il bordo. Il viso frontale non le riceve. Con le mani in vista scendono del 30%
  rimLeft: { color: '#d4b0f5', intensity: 0.9, position: [-1.4, 1.3, -2.4] }, // rosa-lavanda, dietro a sinistra: solo bordo, bassa
  rimViolet: { color: '#8e72f0', intensity: 2.4, position: [1.4, 1.3, -2.4] }, // viola, dietro a destra
  // Rim lavanda dall'alto-dietro: cappello, capelli, spalle e, nel campo lungo, tutta la figura e la sedia (near = primo piano, far = campo lungo)
  rimTop: { color: '#d98cff', near: 1.1, far: 2.2, position: [0.3, 2.8, -1.8] },
  // Riempimenti che seguono la testa (offset dall'osso Head): freddo da destra per leggere il lato destro del viso,
  // e uno dall'alto-davanti per cappello e capelli (piu' forte nel campo lungo, dove la testa e' piccola)
  fillCool: { color: '#b9ccff', near: 0.35, far: 0.2, offset: [1.1, 0.1, 1.1], distance: 4 },
  hatFill: { color: '#e6dcff', near: 0.5, far: 0.9, offset: [0, 0.9, 0.7], distance: 3 },
  // Piccola luce puntiforme davanti al viso: riflesso netto (catchlight) negli occhi lucidi
  catchlight: { color: '#ffffff', intensity: 0.9, offset: [0.2, 0.25, 0.9], distance: 2.5 },
  // Bagliore dello schermo (si accende insieme al monitor): rosa-lavanda pallido
  screenGlow: { color: '#e3b5f5', intensity: 0.22 },
  // Il .glb ha UN solo materiale: qui viene sostituito da un MeshPhysicalMaterial che riusa la stessa texture colore.
  // Pelle: opaca (niente sheen ne' clearcoat). bump = rumore tileable che spezza l'uniformita' (repeat = ripetizioni sull'atlante UV,
  // scale = intensita'). sss = finto subsurface: tinta calda nella fascia al limite tra luce e ombra (width = ampiezza della fascia).
  skin: {
    roughness: 0.65,
    metalness: 0,
    bump: { scale: 0.12, repeat: 14, size: 128 }, // leggerissimo: se si vede come grana, scale: 0
    sss: { color: '#b8593d', strength: 0.35, width: 0.4 }, // tinta calda, non rossa; strength: 0 = spento
    // Capelli, barba, baffi: nel file sono nello stesso materiale della pelle, quindi li riconosco dal colore della texture
    // (zone scure: lumLow..lumHigh e' la luminanza lineare). Li rende piu' ruvidi e aggiunge uno specular morbido (sheen)
    // che fa leggere il volume. Vale anche per le altre parti scure (cappello, vestiti). enabled: false per spegnerlo.
    hair: { enabled: true, lumLow: 0.03, lumHigh: 0.09, roughness: 0.88, sheenColor: '#e8dcff', sheen: 0.45, sheenRoughness: 0.5 },
  },
  // Parti lucide (occhi, denti, colletto). Nel file non hanno un materiale separato: si sceglie per indice di mesh
  // (vedi il log "[look] mesh" in console, con vertici e dimensioni). Metti [] per spegnerlo.
  coat: { meshes: [1], roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 },
  // Sedia (guscio e base si muovono insieme; la scrivania, la tastiera e le mani non si toccano). z negativa = indietro, lontano dalla scrivania.
  // 6 cm: misurato sul modello (sit() + raggi contro il guscio) la schiena non entra piu' nello schienale (a 0 cm: 3,1 cm di compenetrazione; da 5 cm in poi: 0).
  chair: { shiftZ: -0.06, shiftY: 0 },
  // Schermo del monitor: rosa-lavanda pallido, opaco (roughness alta + emissione piu' bassa = niente macchia di riflesso/bagliore)
  screen: { color: '#1a1020', emissive: '#e7b6f5', emissiveIntensity: 1.0, roughness: 0.9, bodyRoughness: 0.65 },
  // Pavimento del campo lungo: alone lavanda + ombre di contatto morbide sotto sedia, scrivania e scarpe + disco scuro lucido con riflesso sfocato.
  // y = quota del piano, misurata dal modello: suole delle scarpe -0,002 m, punte delle gambe della scrivania -0,005 m, ruote della sedia 0 m.
  // ATTENZIONE: y deve restare 0 (o poco sotto) e position[1] a 0: ContactShadows sfoca l'ombra con un piano che sta all'origine del mondo,
  // e se la camera delle ombre sta sopra quel piano (y > 0) o lontano dall'origine, il piano viene scartato e l'ombra resta dura.
  // Le ombre guardano in su da questa quota fino a `far` metri.
  floor: {
    y: 0,
    // Alone chiaro sul pavimento (stesso viola del gradiente di sfondo): l'ombra scura ci poggia sopra e si legge
    halo: { size: 3.8, inner: 'rgba(214, 190, 255, 0.7)', mid: 'rgba(122, 60, 255, 0.4)', midStop: 0.4 },
    // Ombre di contatto: scale = [larghezza x, profondita' z] dell'area coperta (scrivania, sedia e scarpe), centrata in position
    shadows: { opacity: 1, blur: 5, far: 1.0, scale: [4.6, 4.4], position: [0, 0], baseline: 0.125, resolution: 1024, resolutionLow: 512, color: '#0a0514' },
    reflection: { enabled: true, color: '#08060d', radius: 3.4, blur: [300, 80], mixStrength: 0.9, mirror: 0.6, roughness: 0.8, metalness: 0.4, resolution: 512 },
    showFrom: 0.5, // il pavimento esiste solo oltre questo punto dello scroll (0 = hero, 1 = campo lungo)
  },
  post: {
    enabled: true, // false = niente post-processing, tone mapping ACES del renderer
    toneMapping: 'NEUTRAL', // 'NEUTRAL' | 'AGX' | 'ACES_FILMIC'. Per provarli senza toccare il codice: aggiungi ?tm=neutral, ?tm=agx o ?tm=aces all'indirizzo
    exposure: 0.85, // anche ?exp=0.8 all'indirizzo
    aa: 'smaa', // antialiasing: 'smaa' (nitido) oppure 'msaa' (multisampling 4x del composer). ?aa=msaa per provarlo
    // nearScale: quanta occlusione ambientale c'e' nel primo piano rispetto al campo lungo (0 = nessuna sul viso, 1 = uguale)
    ao: { enabled: true, aoRadius: 0.35, distanceFalloff: 1, intensity: 1.6, nearScale: 0.25, quality: 'medium', color: '#14041f' },
    // Rifiniture: spente da `enabled: false` e comunque spente su telefono/touch o se il frame rate cala
    bloom: { enabled: true, intensity: 0.12, luminanceThreshold: 0.9, luminanceSmoothing: 0.2 }, // bloom leggerissimo, solo sui riflessi forti
    dof: { enabled: false, bokehScale: 1.2, worldFocusRange: 0.6, from: 0.05, until: 0.3 }, // SPENTA: con il canvas trasparente rendeva il personaggio invisibile nel primo piano (spariva finche' non si scrollava). Profondita' di campo minima, solo nel primo piano (da..a = tratto di scroll in cui sfuma via)
    vignette: { offset: 0.35, darkness: 0.45 },
  },
  dpr: { desktop: [1, 2], mobile: [1, 1.5] }, // la risoluzione scende solo su telefono/touch, mai per il frame rate
  perf: { minFps: 24 }, // sotto questi fps (misurati) si spengono occlusione ambientale e bloom; la risoluzione non cambia
}
// Prove rapide dall'indirizzo (?tm=agx&exp=0.8): sovrascrivono tone mapping ed esposizione senza toccare i valori sopra
{
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const tm = { aces: 'ACES_FILMIC', agx: 'AGX', neutral: 'NEUTRAL' }[q.get('tm')]
  if (tm) LOOK.post.toneMapping = tm
  const ex = parseFloat(q.get('exp'))
  if (ex > 0) LOOK.post.exposure = ex
  // Diagnosi della sfocatura, un test alla volta: ?post=0 (niente post-processing), ?ao=0, ?bloom=0, ?vig=0, ?aa=msaa,
  // ?bump=0 (niente rumore sulla pelle), ?sss=0 (niente tinta calda), ?hair=0 (niente trattamento capelli)
  if (q.get('post') === '0') LOOK.post.enabled = false
  if (q.get('ao') === '0') LOOK.post.ao.enabled = false
  if (q.get('bloom') === '0') LOOK.post.bloom.enabled = false
  if (q.get('vig') === '0') LOOK.post.vignette.darkness = 0
  if (q.get('aa') === 'msaa') LOOK.post.aa = 'msaa'
  if (q.get('bump') === '0') LOOK.skin.bump.scale = 0
  if (q.get('sss') === '0') LOOK.skin.sss.strength = 0
  if (q.get('hair') === '0') LOOK.skin.hair.enabled = false
}
const TONE = { ACES_FILMIC: ACESFilmicToneMapping, AGX: AgXToneMapping, NEUTRAL: NeutralToneMapping }
const KEY = LOOK.key
const FILL = LOOK.fill
// Telefono o touch: dpr piu' basso e niente occlusione ambientale. Se il frame rate cala, la qualita' scende da sola
const liteDevice = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 800px), (pointer: coarse)').matches

/* ---------- Posa seduta (regola qui se cambi modello o sedia) ---------- */
const SCALE = 1.2 // il personaggio ha gambe corte: ingrandito perche' i piedi arrivino a terra
const HIPS = new Vector3(0, 0.66, -0.05) // dove finisce l'osso del bacino
const FOOT = { x: 0.12, z: 0.36 } // caviglie: distanza dal centro e in avanti
const WRIST = { x: 0.175, y: 0.865, z: 0.22 } // polsi: sopra il bordo della scrivania, le dita cadono sulla tastiera
const LEAN = deg(12) // busto in avanti
const KEYBOARD = { scale: [1.5, 1.3, 1.5], center: [0, 0.74, 0.4], mouseShift: 0.1 } // tastiera ingrandita: le mani del personaggio sono grandi

/* ---------- Camera: tre inquadrature percorse con lo scroll ---------- */
const FOV = 30
const SHOTS = [
  { pos: [0, 1.3, 2.15], look: [0, 1.36, 0.1] }, // hero: viso frontale che guarda in camera, testa e spalle in campo
  { pos: [1.9, 1.75, 2.1], look: [0, 1.0, 0.2] }, // piano medio: busto, mani, monitor
  { pos: [2.95, 2.4, 2.95], look: [0, 0.64, 0.22] }, // campo lungo, tre quarti dall'alto
]
const CAM_POS = new CatmullRomCurve3(SHOTS.map((s) => new Vector3(...s.pos)))
const CAM_LOOK = new CatmullRomCurve3(SHOTS.map((s) => new Vector3(...s.look)))
const SHIFT = 0.22 // nel campo lungo la scena si sposta a sinistra di questa frazione di schermo (colonna di "Cosa faccio")
// Su schermi stretti la camera arretra perche' il soggetto stia in larghezza: fattore = valore / (larghezza / altezza), minimo 1
const FIT = { face: 0.8, wideOneColumn: 0.9, wideTwoColumns: 1.68 }
const HERO_LIFT = 0.1 // su telefono, nella hero il viso sale di questa frazione di schermo
const FACE = [0, 0.2, 0.1] // dall'osso Head al centro del viso
// Dita: ogni dito batte per conto suo, con tempi e ampiezze diversi. Due dita vicine non si piegano mai insieme.
// spread: divaricazione (rad) sull'asse Y locale dell'osso 1, uguale su mano sinistra e destra.
// amp: quanto batte rispetto al massimo; dur: durata tipica di un colpo (s).
const FINGERS = [
  { name: 'Index', spread: 0.05, amp: 0.9, dur: 0.15 },
  { name: 'Middle', spread: 0.02, amp: 1, dur: 0.17 },
  { name: 'Ring', spread: -0.03, amp: 0.85, dur: 0.19 },
  { name: 'Pinky', spread: -0.07, amp: 0.7, dur: 0.22 },
]
const BEND_MAX = [0.35, 0.5, 0.3] // rad, massimo del colpo sulle tre falangi (osso 1, 2, 3)
const CURL_REST = [0.1, 0.16, 0.1] // rad: leggera curva a riposo, come di dita appoggiate sui tasti
const BEND_LIMIT = [0.6, 0.9, 0.6] // rad: tetto assoluto della piega sulle tre falangi, qualunque cosa arrivi dal calcolo
const DEBUG_FINGERS = true // TEMPORANEO: ogni secondo stampa in console angolo massimo e scala di ogni osso delle dita
const FOLLOW_FAR = 0.2 // nel campo lungo la testa segue il mouse solo per questa frazione
const SCREEN_PITCH = deg(12) // nel campo lungo la testa si abbassa verso il monitor
const BREATH = deg(0.8) // ampiezza del respiro sul busto
const DESK_IN = [0.04, 0.3] // tratto di scroll in cui compaiono scrivania, sedia e tastiera
const MONITOR_IN = [0.32, 0.58] // il monitor arriva dopo, quando la camera si e' spostata di lato: di fronte coprirebbe il viso
const MONITOR_BASE = [0, 0.74, 0.71] // punto del piano da cui il monitor cresce (pieno, mai trasparente)

/* ---------- Rotazioni espresse in assi mondo (gli assi locali delle ossa sono imprevedibili) ---------- */
const _a = new Quaternion()
const _b = new Quaternion()
const _v1 = new Vector3()
const _v2 = new Vector3()
const wp = (o, out = new Vector3()) => o.getWorldPosition(out)

function setWorldQuat(bone, qWorld) {
  bone.parent.getWorldQuaternion(_a)
  bone.quaternion.copy(_a.invert().multiply(qWorld))
  bone.updateWorldMatrix(false, true)
}

function rotateWorld(bone, qDelta) {
  bone.getWorldQuaternion(_b).premultiply(qDelta)
  setWorldQuat(bone, _b)
}

// Punta l'osso in modo che il figlio `child` finisca nella direzione `dir`
function aim(bone, child, dir) {
  const cur = wp(child, _v1).sub(wp(bone, _v2)).normalize()
  rotateWorld(bone, new Quaternion().setFromUnitVectors(cur, dir))
}

// Cinematica inversa a due ossa (coscia+gamba, braccio+avambraccio): porta `end` su `target`,
// con il gomito/ginocchio che sporge verso `pole`.
function solveLimb(upper, lower, end, target, pole) {
  const a = wp(upper)
  const l1 = a.distanceTo(wp(lower))
  const l2 = wp(lower).distanceTo(wp(end))
  const dir = target.clone().sub(a)
  const len = MathUtils.clamp(dir.length(), Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4)
  dir.normalize()
  const x = (l1 * l1 - l2 * l2 + len * len) / (2 * len)
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x))
  const perp = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize()
  const joint = a.clone().addScaledVector(dir, x).addScaledVector(perp, h)
  aim(upper, lower, joint.clone().sub(a).normalize())
  aim(lower, end, a.clone().addScaledVector(dir, len).sub(joint).normalize())
}

// Rotazione che porta la coppia (dita, palmo) da una direzione a un'altra
function basisQuat(forward, normal) {
  const f = forward.clone().normalize()
  const n = normal.clone().addScaledVector(f, -normal.dot(f)).normalize()
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(f, n, f.clone().cross(n)))
}

// Mette il personaggio seduto ruotando solo le ossa e restituisce cio' che serve per animarlo
function sit(root) {
  const bone = (name) => root.getObjectByName(name)
  root.scale.setScalar(SCALE)
  root.position.set(0, 0, 0)
  root.updateMatrixWorld(true)

  // Orientamenti in T-pose: piedi piatti a terra, mani con dita verso l'esterno e palmi in giu'
  const tpose = {}
  for (const n of ['LeftFoot', 'RightFoot', 'LeftHand', 'RightHand']) tpose[n] = bone(n).getWorldQuaternion(new Quaternion())
  const ankleY = wp(bone('LeftFoot')).y

  // Bacino sulla seduta (si sposta tutto il personaggio, la mesh non viene toccata)
  const standing = wp(bone('Hips'))
  root.position.copy(HIPS).sub(standing)
  root.updateMatrixWorld(true)

  // Gambe: cosce in avanti, ginocchia piegate, piedi piatti a terra
  for (const [side, s] of [['Left', 1], ['Right', -1]]) {
    const foot = bone(`${side}Foot`)
    solveLimb(bone(`${side}UpLeg`), bone(`${side}Leg`), foot, new Vector3(s * FOOT.x, ankleY, FOOT.z), new Vector3(0, 1, 0.4))
    setWorldQuat(foot, tpose[`${side}Foot`])
  }

  // Busto leggermente in avanti, la testa resta quasi dritta
  rotateWorld(bone('Spine02'), new Quaternion().setFromAxisAngle(X, LEAN * 0.6))
  rotateWorld(bone('Spine'), new Quaternion().setFromAxisAngle(X, LEAN * 0.4))
  rotateWorld(bone('neck'), new Quaternion().setFromAxisAngle(X, -LEAN * 0.5))

  // Braccia: gomiti piegati lungo i fianchi, mani sopra la tastiera con i palmi in giu'
  for (const [side, s] of [['Left', 1], ['Right', -1]]) {
    const arm = bone(`${side}Arm`)
    const fore = bone(`${side}ForeArm`)
    const hand = bone(`${side}Hand`)
    solveLimb(arm, fore, hand, new Vector3(s * WRIST.x, WRIST.y, WRIST.z), new Vector3(s * 0.55, -1, -0.6))
    const from = basisQuat(new Vector3(s, 0, 0), new Vector3(0, -1, 0))
    const to = basisQuat(new Vector3(-s * 0.1, -0.07, 1), new Vector3(0, -1, 0))
    const wanted = to.multiply(from.invert()).multiply(tpose[`${side}Hand`])
    // Parte della torsione va sull'avambraccio, altrimenti il polso si strozza
    const r = wanted.clone().multiply(hand.getWorldQuaternion(new Quaternion()).invert())
    const axis = wp(hand).sub(wp(fore)).normalize()
    const d = axis.dot(_v1.set(r.x, r.y, r.z))
    const twist = new Quaternion(axis.x * d, axis.y * d, axis.z * d, r.w).normalize()
    rotateWorld(fore, new Quaternion().slerp(twist, 0.6))
    setWorldQuat(hand, wanted)
  }
  root.updateMatrixWorld(true)

  // Posa di riposo: tutte le animazioni partono da qui
  const part = (name) => {
    const b = bone(name)
    return { bone: b, rest: b.quaternion.clone(), parentW: b.parent.getWorldQuaternion(new Quaternion()) }
  }
  return {
    spine: part('Spine'),
    neck: part('neck'),
    head: part('Head'),
    arms: ['Left', 'Right'].map((side) => ({ fore: part(`${side}ForeArm`), hand: part(`${side}Hand`) })),
  }
}

// Applica all'osso una rotazione in assi mondo a partire dalla posa di riposo
function pose(p, parentW, qWorld) {
  p.bone.quaternion.copy(parentW).invert().multiply(qWorld).multiply(parentW).multiply(p.rest)
}

/* ---------- Puntatore: coordinate -1..1 sulla finestra, solo mouse ---------- */
function usePointer() {
  const p = useRef({ x: 0, y: 0, active: false })
  useEffect(() => {
    const move = (e) => {
      if (e.pointerType !== 'mouse') return
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
      p.current.active = true
    }
    const leave = () => {
      p.current.active = false
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [])
  return p
}

// Alone chiaro sfumato da stendere sul pavimento
function makeHalo() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  const H = LOOK.floor.halo
  grad.addColorStop(0, H.inner)
  grad.addColorStop(H.midStop, H.mid)
  grad.addColorStop(1, 'rgba(122, 60, 255, 0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

// La texture colore resta quella del file (l'atlante UV e' molto frammentato: niente sfocature o ridimensionamenti, non comprimere il .glb).
// Con il post-processing il tone mapping lo fa l'effetto ToneMapping; senza, lo fa il renderer. Canvas trasparente: dietro c'e' il CSS.
const GL = {
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
  toneMapping: LOOK.post.enabled ? NoToneMapping : TONE[LOOK.post.toneMapping],
  toneMappingExposure: LOOK.post.exposure,
}

// Rumore tileable per il bump: valori casuali sfumati con un filtro 3x3 che chiude i bordi su se stessi, poi riportati a pieno contrasto
function makeBumpTexture() {
  const { size: n, repeat } = LOOK.skin.bump
  const a = Float32Array.from({ length: n * n }, Math.random)
  const b = new Float32Array(n * n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let sum = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += a[((y + dy + n) % n) * n + ((x + dx + n) % n)]
      b[y * n + x] = sum / 9
    }
  }
  const lo = Math.min(...b)
  const hi = Math.max(...b)
  const c = document.createElement('canvas')
  c.width = c.height = n
  const g = c.getContext('2d')
  const img = g.createImageData(n, n)
  for (let i = 0; i < n * n; i++) {
    const v = ((b[i] - lo) / (hi - lo)) * 255
    img.data.set([v, v, v, 255], i * 4)
  }
  g.putImageData(img, 0, 0)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(repeat, repeat)
  return t
}

const HAIR_ROUGH_GLSL = `
float hairMask = 1.0 - smoothstep( hairRange.x, hairRange.y, dot( diffuseColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) ) );
roughnessFactor = mix( roughnessFactor, hairRoughness, hairMask );
`
const HAIR_SHEEN_GLSL = `
#ifdef USE_SHEEN
material.sheenColor = hairSheen * hairMask;
#endif
`

// Finto subsurface scattering: per ogni luce direzionale, nella fascia dove la superficie passa da illuminata a in ombra
// (normale quasi perpendicolare alla luce) si aggiunge una tinta calda moltiplicata per il colore della pelle
const SSS_GLSL = `
#if NUM_DIR_LIGHTS > 0
{
  vec3 sssSum = vec3( 0.0 );
  float sssNdl;
  float sssBand;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
    sssNdl = dot( normal, directionalLights[ i ].direction );
    sssBand = smoothstep( - sssWidth, 0.0, sssNdl ) * ( 1.0 - smoothstep( 0.0, sssWidth, sssNdl ) );
    sssSum += directionalLights[ i ].color * sssBand;
  }
  #pragma unroll_loop_end
  reflectedLight.directDiffuse += sssSum * sssColor * diffuseColor.rgb * sssStrength * RECIPROCAL_PI;
}
#endif
`

// Materiale della pelle (coat = false) o delle parti lucide (coat = true). Stessa texture colore del file.
function makeSkinMaterial({ map, side, coat, bump }) {
  const { roughness, metalness, sss, hair } = LOOK.skin
  if (coat) {
    return new MeshPhysicalMaterial({
      map,
      side,
      metalness,
      roughness: LOOK.coat.roughness,
      clearcoat: LOOK.coat.clearcoat,
      clearcoatRoughness: LOOK.coat.clearcoatRoughness,
    })
  }
  const m = new MeshPhysicalMaterial({
    map,
    side,
    metalness,
    roughness,
    bumpMap: bump,
    bumpScale: LOOK.skin.bump.scale,
    // sheen acceso ma nero: sulla pelle non fa nulla; lo shader lo colora solo sulle zone "capelli"
    sheen: hair.enabled ? 1 : 0,
    sheenColor: new Color(0, 0, 0),
    sheenRoughness: hair.sheenRoughness,
  })
  m.onBeforeCompile = (shader) => {
    shader.uniforms.sssColor = { value: new Color(sss.color) }
    shader.uniforms.sssStrength = { value: sss.strength }
    shader.uniforms.sssWidth = { value: sss.width }
    shader.uniforms.hairRange = { value: new Vector2(hair.lumLow, hair.lumHigh) }
    shader.uniforms.hairRoughness = { value: hair.roughness }
    shader.uniforms.hairSheen = { value: new Color(hair.sheenColor).multiplyScalar(hair.sheen) }
    let f = shader.fragmentShader
    const patch = (from, to) => {
      if (!f.includes(from)) console.warn(`[look] shader di three cambiato: manca ${from}`)
      f = f.replace(from, to)
    }
    patch('void main() {', 'uniform vec3 sssColor;\nuniform float sssStrength;\nuniform float sssWidth;\nuniform vec2 hairRange;\nuniform float hairRoughness;\nuniform vec3 hairSheen;\nvoid main() {')
    patch('#include <lights_fragment_begin>', `#include <lights_fragment_begin>\n${SSS_GLSL}`)
    if (hair.enabled) {
      // zone scure della texture = capelli: piu' ruvide e con sheen morbido
      patch('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${HAIR_ROUGH_GLSL}`)
      patch('#include <lights_physical_fragment>', `#include <lights_physical_fragment>\n${HAIR_SHEEN_GLSL}`)
    }
    shader.fragmentShader = f
  }
  m.customProgramCacheKey = () => `skin-sss-${hair.enabled ? 'hair' : 'nohair'}`
  return m
}

function disposeTree(root) {
  root.traverse((o) => {
    o.geometry?.dispose()
    o.skeleton?.dispose()
    for (const m of [].concat(o.material || [])) {
      for (const v of Object.values(m)) if (v?.isTexture) v.dispose()
      m.dispose()
    }
  })
}

const _yaw = new Quaternion()
const _pitch = new Quaternion()
const _q = new Quaternion()
const _pw = new Quaternion()
const _sw = new Quaternion()
const _hp = new Vector3()
const _fy = new Quaternion()
const _fz = new Quaternion()

// Mano -> dita: ossa Index/Middle/Ring/Pinky 1-3 con la loro rotazione a riposo
function collectFingers(root, side) {
  return FINGERS.map((f) => ({
    ...f,
    bones: [1, 2, 3].map((n) => {
      const bone = root.getObjectByName(`${side}Hand${f.name}${n}`)
      return { bone, rest: bone.quaternion.clone() }
    }),
  }))
}

// Applica alle tre falangi di ogni dito la piega `flex[i]` (0..1) sopra la curva a riposo.
// Asse Z locale positivo = verso il palmo; la divaricazione e' una rotazione sull'asse Y locale dell'osso 1.
// Ogni frame si riparte dalla rotazione a riposo salvata al caricamento: niente si accumula. Solo rotazione, mai scala o posizione.
// `weight` (0..1) dosa tutta la posa: a 0 le ossa tornano esattamente alla rotazione salvata.
function bendFingers(fingers, flex, weight = 1) {
  const w = MathUtils.clamp(weight || 0, 0, 1)
  fingers.forEach((f, i) => {
    const fl = MathUtils.clamp(flex[i] || 0, 0, 1)
    f.bones.forEach(({ bone, rest }, j) => {
      bone.quaternion.copy(rest)
      if (w === 0) return
      if (j === 0) bone.quaternion.multiply(_fy.setFromAxisAngle(Y, f.spread * w))
      const angle = MathUtils.clamp((CURL_REST[j] + BEND_MAX[j] * fl) * w, 0, BEND_LIMIT[j])
      bone.quaternion.multiply(_fz.setFromAxisAngle(Z, angle))
    })
  })
}

// Mano ferma: nessun colpo in corso, il prossimo parte poco dopo la ripresa
function restHand(h) {
  h.strokes.length = 0
  h.flex.fill(0)
  h.next = h.t + 0.2
}

// Sequenza dei colpi di una mano: sceglie il prossimo dito tra quelli liberi (mai uno vicino a un dito gia' in movimento).
// Il tempo e' quello della mano (h.t), che va solo avanti a passi di `dt`: l'orologio di three non va usato qui,
// perche' riparte da zero ogni volta che il render si ferma e riprende (scena uscita e rientrata nello schermo).
function stepHand(h, dt) {
  h.t += dt
  const t = h.t
  h.strokes = h.strokes.filter((s) => t < s.t0 + s.dur)
  if (t >= h.next) {
    const free = [0, 1, 2, 3].filter((i) => h.strokes.every((s) => Math.abs(s.i - i) > 1))
    const fresh = free.filter((i) => i !== h.last)
    const pool = fresh.length ? fresh : free
    if (pool.length) {
      const i = pool[Math.floor(Math.random() * pool.length)]
      const f = FINGERS[i]
      h.strokes.push({ i, t0: t, dur: Math.max(f.dur * (0.8 + Math.random() * 0.5), dt * 3), amp: f.amp * (0.65 + Math.random() * 0.35) })
      h.last = i
      h.next = t + 0.06 + Math.random() * 0.18
    } else {
      h.next = t + 0.03
    }
  }
  h.flex.fill(0)
  for (const s of h.strokes) {
    const p = MathUtils.clamp((t - s.t0) / s.dur, 0, 1)
    const e = (x) => x * x * (3 - 2 * x)
    const v = p < 0.35 ? e(p / 0.35) : 1 - e((p - 0.35) / 0.65) // giu' veloce, su piu' lento
    h.flex[s.i] = Math.max(h.flex[s.i], v * s.amp)
  }
  return h.flex
}
const _face = new Vector3()
const _off = new Vector3()

// Maschera circolare: bianco al centro, nero ai bordi (il disco del pavimento sfuma nel nulla)
function makeFade() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, '#fff')
  grad.addColorStop(0.45, '#fff')
  grad.addColorStop(1, '#000')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  return new CanvasTexture(c)
}

// Pavimento del campo lungo: ombre di contatto sotto sedia, scrivania e scarpe, e un disco scuro lucido con riflesso sfocato
function Floor({ low }) {
  const { y, shadows, reflection } = LOOK.floor
  const { position, resolutionLow, resolution, baseline, ...shadowProps } = shadows
  const fade = useMemo(makeFade, [])
  // ContactShadows lascia nella mappa un velo uniforme (circa baseline / far) su tutto il rettangolo: si vedeva come un bordo netto
  // sul pavimento. Lo sottraggo dall'alfa del piano, cosi' restano solo le ombre vere.
  const shadowRef = useRef(null)
  useEffect(() => {
    const mat = shadowRef.current?.children.find((o) => o.isMesh)?.material
    if (!mat) return
    const base = Math.min(0.9, baseline / shadowProps.far)
    mat.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
diffuseColor.a = max( 0.0, ( diffuseColor.a - ${base.toFixed(4)} ) / ${(1 - base).toFixed(4)} );`)
    }
    mat.needsUpdate = true
  }, [baseline, shadowProps.far])
  useEffect(() => () => fade.dispose(), [fade])
  return (
    <>
      {/* renderOrder: riflesso (1) < alone (2) < ombre (3). Prima l'ombra spariva sotto l'alone, perche' erano ordinate per distanza dalla camera */}
      <ContactShadows ref={shadowRef} position={[position[0], y, position[1]]} {...shadowProps} resolution={low ? resolutionLow : resolution} frames={Infinity} renderOrder={3} />
      {reflection.enabled && !low && (
        <mesh rotation-x={-Math.PI / 2} position={[0, y - 0.0015, 0.25]} renderOrder={1}>
          <circleGeometry args={[reflection.radius, 64]} />
          <MeshReflectorMaterial
            color={reflection.color}
            blur={reflection.blur}
            mixBlur={1}
            mixStrength={reflection.mixStrength}
            mirror={reflection.mirror}
            roughness={reflection.roughness}
            metalness={reflection.metalness}
            resolution={reflection.resolution}
            alphaMap={fade}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  )
}

function Models({ animate, progress, onReady, low }) {
  const { scene: character, animations } = useGLTF(CHARACTER_URL)
  const desk = useGLTF(DESK_URL).scene
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const pointer = usePointer()
  const rig = useRef(null)
  const look = useRef({ yaw: 0, pitch: 0 })
  const halo = useMemo(makeHalo, [])
  const haloMat = useRef()
  const glow = useRef()
  const deskMats = useRef([])
  const monitorParts = useRef([])
  const anim = useRef(null)
  const keyLight = useRef()
  const rimLeft = useRef()
  const rimViolet = useRef()
  const rimTop = useRef()
  const fillLight = useRef()
  const fillCool = useRef()
  const hatFill = useRef()
  const catchlight = useRef()
  const [floorOn, setFloorOn] = useState(false)
  const headBone = useRef(null)
  const hands = useRef(null)
  const fingerLog = useRef(null)
  const loaded = useRef(false) // modelli montati e in posa
  const shownFrames = useRef(0)
  const announced = useRef(false)

  useLayoutEffect(() => {
    rig.current = sit(character)
    headBone.current = character.getObjectByName('Head')
    hands.current = ['Left', 'Right'].map((side) => ({
      fingers: collectFingers(character, side),
      t: 0,
      strokes: [],
      flex: [0, 0, 0, 0],
      next: 0.3 + Math.random() * 0.4,
      last: -1,
    }))
    // Per il log di controllo: tutte le ossa delle dita (pollici compresi, che nessuno muove) con la rotazione a riposo
    fingerLog.current = {
      at: 0,
      bones: ['Left', 'Right'].flatMap((side) =>
        ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'].flatMap((f) =>
          [1, 2, 3].map((n) => {
            const bone = character.getObjectByName(`${side}Hand${f}${n}`)
            return { bone, rest: bone.quaternion.clone(), max: 0 }
          }),
        ),
      ),
    }
    hands.current.forEach((h) => bendFingers(h.fingers, h.flex)) // curva a riposo anche con "riduci movimento"
    // La posa cambia la sagoma: senza questo la mesh sparirebbe quando la sagoma originale esce dall'inquadratura
    const anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy())
    // Materiali: stessa texture colore del file (sRGB, anisotropia al massimo). Pelle opaca con bump leggero e finto SSS,
    // vernice trasparente solo sulle mesh scelte in LOOK.coat. Nessun'altra modifica alla texture.
    const skinMat = new Map()
    const bump = makeBumpTexture()
    let meshIndex = 0
    character.traverse((o) => {
      if (!o.isSkinnedMesh) return
      o.frustumCulled = false
      const old = o.material
      const map = old.map
      if (map) {
        map.colorSpace = SRGBColorSpace
        map.generateMipmaps = true
        map.minFilter = LinearMipmapLinearFilter
        map.magFilter = LinearFilter
        map.anisotropy = anisotropy
        map.needsUpdate = true
      }
      const coat = LOOK.coat.meshes.includes(meshIndex)
      if (!skinMat.has(coat)) {
        skinMat.set(coat, makeSkinMaterial({ map, side: old.side, coat, bump }))
      }
      o.material = skinMat.get(coat)
      if (old !== o.material && !old.isMeshPhysicalMaterial) old.dispose()
      o.geometry.computeBoundingBox()
      const size = o.geometry.boundingBox.getSize(new Vector3())
      console.log(`[look] mesh ${meshIndex} "${o.name}": ${o.geometry.attributes.position.count} vertici, dimensioni ${size.toArray().map((v) => v.toFixed(2)).join(' x ')}${coat ? ' (vernice)' : ''}`)
      meshIndex++
    })
    // Tastiera ingrandita attorno al suo centro (resta appoggiata al piano); il mouse si sposta per farle posto
    for (const name of ['keyboard_base', 'keyboard_keys']) {
      const o = desk.getObjectByName(name)
      if (!o) continue
      o.scale.set(...KEYBOARD.scale)
      o.position.set(...KEYBOARD.center.map((c, i) => c * (1 - KEYBOARD.scale[i])))
    }
    // Sedia piu' indietro (posizioni assolute: nel file questi nodi non hanno traslazione)
    for (const name of ['chair_shell', 'chair_legs']) desk.getObjectByName(name)?.position.set(0, LOOK.chair.shiftY, LOOK.chair.shiftZ)
    const mouse = desk.getObjectByName('mouse')
    if (mouse) mouse.position.x = KEYBOARD.mouseShift
    // Schermo acceso: rosa-lavanda pallido, opaco (vedi LOOK.screen)
    const screen = desk.getObjectByName('monitor_screen')
    if (screen) {
      screen.material.dispose()
      const S = LOOK.screen
      screen.material = new MeshStandardMaterial({ color: S.color, emissive: S.emissive, emissiveIntensity: S.emissiveIntensity, roughness: S.roughness, metalness: 0 })
    }
    // Il monitor non sfuma con il resto: cresce dal piano gia' pieno. Gli serve un materiale suo,
    // altrimenti la dissolvenza di scrivania e sedia lo renderebbe trasparente.
    const body = desk.getObjectByName('monitor_body')
    if (body) {
      body.material = body.material.clone()
      body.material.roughness = Math.max(body.material.roughness, LOOK.screen.bodyRoughness)
    }
    const mats = new Set()
    const monitor = []
    desk.traverse((o) => {
      if (!o.material) return
      if (o.name.startsWith('monitor')) monitor.push(o)
      else mats.add(o.material)
    })
    deskMats.current = [...mats]
    monitorParts.current = monitor
    // Pronta solo dopo qualche frame disegnato (vedi useFrame): cosi' la compilazione degli shader avviene
    // mentre la schermata iniziale e' ancora sopra, e il personaggio e' gia' li' quando sparisce
    loaded.current = true
    invalidate()
    return () => {
      disposeTree(character)
      disposeTree(desk)
      useGLTF.clear([CHARACTER_URL, DESK_URL])
    }
  }, [character, desk, gl, invalidate, onReady])

  useEffect(() => () => halo.dispose(), [halo])

  // Clip 'Blink' del modello: battito di ciglia a intervalli casuali. Le dita non usano la clip 'TypeFingers': le muovo a mano (vedi stepHand).
  // La clip 'Armature|clip0|baselayer' non va riprodotta: e' un solo fotogramma in T-pose su tutte le ossa del corpo
  // e annullerebbe la posa seduta e la testa che segue il mouse.
  useEffect(() => {
    if (!animate) return
    const mixer = new AnimationMixer(character)
    const clip = (name) => animations.find((a) => a.name === name)
    const blink = clip('Blink') && mixer.clipAction(clip('Blink'))
    const timers = new Set()
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
    }
    if (blink) {
      blink.setLoop(LoopOnce, 1)
      blink.clampWhenFinished = false // a fine clip gli occhi tornano aperti
      const once = () => blink.reset().play()
      const next = () =>
        later(() => {
          once()
          if (Math.random() < 0.2) later(once, 250) // ogni tanto doppio
          next()
        }, 2500 + Math.random() * 3500)
      next()
    }
    anim.current = { mixer }
    return () => {
      timers.forEach(clearTimeout)
      anim.current = null
      mixer.stopAllAction()
      mixer.uncacheRoot(character)
    }
  }, [character, animations, animate])

  useFrame((state, delta) => {
    if (loaded.current && !announced.current) {
      if (++shownFrames.current >= 3) {
        announced.current = true
        onReady?.()
      } else invalidate() // con "riduci movimento" il render e' a richiesta: ne serve uno per ogni frame di riscaldamento
    }
    // Scrivania, sedia e alone compaiono mentre la camera si allontana dal viso
    // Schermi verticali: la camera deve arretrare, quindi nel primo piano si vedono anche le mani: scrivania e tastiera ci sono da subito
    const portrait = state.size.width < state.size.height
    const lightFar = MathUtils.smoothstep(progress.current, 0.1, 0.9) // 0 = primo piano, 1 = campo lungo
    const head = headBone.current
    if (head && keyLight.current && fillLight.current) {
      head.getWorldPosition(_hp).add(_face.set(...FACE))
      keyLight.current.position.copy(_hp).add(_off.set(...KEY.offset))
      keyLight.current.target.position.copy(_hp)
      keyLight.current.target.updateMatrixWorld()
      keyLight.current.intensity = MathUtils.lerp(KEY.near, KEY.far, lightFar)
      fillLight.current.position.copy(_hp).add(_off.set(...FILL.offset))
      fillLight.current.intensity = MathUtils.lerp(FILL.near, FILL.far, lightFar)
      for (const [ref, cfg] of [[fillCool, LOOK.fillCool], [hatFill, LOOK.hatFill], [catchlight, LOOK.catchlight]]) {
        if (!ref.current) continue
        ref.current.position.copy(_hp).add(_off.set(...cfg.offset))
        if (cfg.near !== undefined) ref.current.intensity = MathUtils.lerp(cfg.near, cfg.far, lightFar)
      }
    }
    const handsInView = portrait ? 1 : MathUtils.smoothstep(progress.current, 0.2, 0.6)
    const rimK = 1 - 0.3 * handsInView
    if (rimLeft.current) rimLeft.current.intensity = LOOK.rimLeft.intensity * rimK
    if (rimViolet.current) rimViolet.current.intensity = LOOK.rimViolet.intensity * rimK
    if (rimTop.current) rimTop.current.intensity = MathUtils.lerp(LOOK.rimTop.near, LOOK.rimTop.far, lightFar)
    // Il pavimento (ombre e riflesso) si monta solo nel campo lungo: prima non e' nemmeno in inquadratura
    const wantFloor = progress.current > LOOK.floor.showFrom
    if (wantFloor !== floorOn) setFloorOn(wantFloor)
    const show = portrait ? 1 : MathUtils.smoothstep(progress.current, DESK_IN[0], DESK_IN[1])
    const showMonitor = MathUtils.smoothstep(progress.current, MONITOR_IN[0], MONITOR_IN[1])
    desk.visible = show > 0.001
    for (const m of deskMats.current) {
      m.transparent = show < 1
      m.opacity = show
    }
    for (const o of monitorParts.current) {
      o.visible = showMonitor > 0.001
      o.scale.setScalar(showMonitor)
      o.position.set(...MONITOR_BASE).multiplyScalar(1 - showMonitor)
    }
    if (haloMat.current) haloMat.current.opacity = show
    if (glow.current) glow.current.intensity = LOOK.screenGlow.intensity * showMonitor

    const r = rig.current
    if (!r || !animate) return
    const dt = Math.min(delta, 1 / 30) // dopo un cambio scheda o uno scroll veloce il delta puo' essere enorme
    const t = state.clock.elapsedTime

    // Palpebre (clip Blink)
    anim.current?.mixer.update(dt) // solo avanti, mai oltre 1/30 s: la clip non salta ne' va fuori durata

    // Dita: digitano solo quando la scrivania e' comparsa sotto le mani. Fuori (hero) i colpi si fermano
    // e le ossa tornano alla rotazione salvata al caricamento.
    hands.current?.forEach((h) => {
      if (show > 0.001) stepHand(h, dt)
      else restHand(h)
      bendFingers(h.fingers, h.flex, show)
    })

    // TEMPORANEO: controllo che le dita non esplodano. Angolo massimo dalla posa di riposo nell'ultimo secondo e scala.
    const log = fingerLog.current
    if (DEBUG_FINGERS && log) {
      for (const b of log.bones) b.max = Math.max(b.max, b.rest.angleTo(b.bone.quaternion))
      const now = performance.now()
      if (now - log.at >= 1000) {
        log.at = now
        console.log(`[dita] progress ${progress.current.toFixed(2)} | angolo max ${Math.max(...log.bones.map((b) => b.max)).toFixed(3)} rad`)
        console.table(
          Object.fromEntries(
            log.bones.map((b) => [b.bone.name, { 'angolo max (rad)': +b.max.toFixed(3), scala: b.bone.scale.toArray().map((v) => +v.toFixed(3)).join(' ') }]),
          ),
        )
        for (const b of log.bones) b.max = 0
      }
    }

    const far = MathUtils.smoothstep(progress.current, 0.1, 0.9) // 0 = primo piano, 1 = campo lungo

    // Respiro: il busto si muove appena, cosi' a mouse fermo non sembra una statua
    pose(r.spine, r.spine.parentW, _q.setFromAxisAngle(X, Math.sin(t * 1.25) * BREATH))
    const spineW = _sw.copy(r.spine.parentW).multiply(r.spine.bone.quaternion)

    // A. Testa: segue il mouse, con una lenta oscillazione sempre presente. Allontanandosi il mouse conta sempre meno
    // e la testa si abbassa verso il monitor: mentre scrive guarda lo schermo e accenna solo a girarsi.
    const p = pointer.current
    // Solo con un mouse vero e uno schermo largo: su telefono, e in una finestra stretta, la testa resta al centro
    const follow = p.active && state.size.width > 800 ? MathUtils.lerp(1, FOLLOW_FAR, far) : 0
    const yawTo = p.x * deg(35) * follow + Math.sin(t * 0.55) * deg(1.5)
    const pitchTo = -p.y * deg(20) * follow + Math.sin(t * 0.41 + 1) * deg(1) + far * SCREEN_PITCH
    const l = look.current
    l.yaw = MathUtils.damp(l.yaw, yawTo, 5, dt)
    l.pitch = MathUtils.damp(l.pitch, pitchTo, 5, dt)
    for (const [part, share] of [[r.neck, 0.3], [r.head, 0.7]]) {
      _yaw.setFromAxisAngle(Y, l.yaw * share)
      _pitch.setFromAxisAngle(X, l.pitch * share)
      // collo e testa sono figli di ossa che si sono appena mosse (busto, collo)
      const parentW = part === r.head ? _pw.copy(spineW).multiply(r.neck.bone.quaternion) : spineW
      pose(part, parentW, _q.copy(_yaw).multiply(_pitch))
    }

    // B. Battitura (senza ossa delle dita): avambracci e polsi con colpetti irregolari e piccoli spostamenti laterali
    r.arms.forEach(({ fore, hand }, i) => {
      const ph = i * 2.4
      const tap = (tt) => Math.sin(tt * 9.1 + ph) * 0.5 + Math.sin(tt * 13.7 + ph * 2.3) * 0.3 + Math.sin(tt * 5.3 + ph * 0.7) * 0.2
      const burst = 0.65 + 0.35 * Math.sin(t * 0.9 + ph)
      const drift = Math.sin(t * 0.7 + ph) * deg(2.2) + Math.sin(t * 1.9 + ph * 1.7) * deg(0.9)
      _yaw.setFromAxisAngle(Y, drift)
      _pitch.setFromAxisAngle(X, tap(t) * burst * deg(1.4))
      pose(fore, fore.parentW, _q.copy(_yaw).multiply(_pitch))
      _pitch.setFromAxisAngle(X, tap(t - 0.04) * burst * deg(5))
      pose(hand, _pw.copy(fore.parentW).multiply(fore.bone.quaternion), _pitch)
    })
  })

  return (
    <>
      <primitive object={desk} />
      <primitive object={character} />
      {/* Luce chiave: davanti, in alto, un po' a destra, puntata sull'osso Head (posizione e intensita' aggiornate a ogni frame) */}
      <directionalLight ref={keyLight} intensity={KEY.near} color={KEY.color} />
      {/* Controluci da dietro: rosa-lavanda a sinistra, viola a destra, lavanda dall'alto. Disegnano il bordo di cappello, orecchie e spalle */}
      <directionalLight ref={rimLeft} position={LOOK.rimLeft.position} intensity={LOOK.rimLeft.intensity} color={LOOK.rimLeft.color} />
      <directionalLight ref={rimViolet} position={LOOK.rimViolet.position} intensity={LOOK.rimViolet.intensity} color={LOOK.rimViolet.color} />
      <directionalLight ref={rimTop} position={LOOK.rimTop.position} intensity={LOOK.rimTop.near} color={LOOK.rimTop.color} />
      {/* Riempimento debole davanti al viso: nessuna ombra, schiarisce soltanto */}
      <pointLight ref={fillLight} intensity={FILL.near} distance={FILL.distance} color={FILL.color} />
      {/* Riempimento freddo da destra, riempimento per cappello e capelli, riflesso negli occhi */}
      <pointLight ref={fillCool} intensity={LOOK.fillCool.near} distance={LOOK.fillCool.distance} color={LOOK.fillCool.color} />
      <pointLight ref={hatFill} intensity={LOOK.hatFill.near} distance={LOOK.hatFill.distance} color={LOOK.hatFill.color} />
      <pointLight ref={catchlight} intensity={LOOK.catchlight.intensity} distance={LOOK.catchlight.distance} color={LOOK.catchlight.color} />
      {/* Bagliore rosa dello schermo, davanti al petto: sfiora mani e mento. Si accende insieme al monitor */}
      <pointLight ref={glow} position={[0, 0.88, 0.48]} intensity={0} distance={0.75} color={LOOK.screenGlow.color} />
      {floorOn && <Floor low={low} />}
      {/* Alone chiaro sul pavimento sotto la scrivania */}
      <mesh rotation-x={-Math.PI / 2} position={[0, LOOK.floor.y - 0.001, 0.3]} renderOrder={2}>
        <planeGeometry args={[LOOK.floor.halo.size, LOOK.floor.halo.size]} />
        <meshBasicMaterial ref={haloMat} map={halo} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  )
}

const _pos = new Vector3()
const _look = new Vector3()

// Camera: con `scrub` segue lo scroll (0 = viso nella hero, 1 = campo lungo), altrimenti resta sul viso
function Rig({ trackRef, scrub, progress }) {
  const started = useRef(false)
  useFrame((state, delta) => {
    const { camera, size } = state
    let to = 0
    if (scrub && trackRef.current) {
      // La transizione dura una schermata di scroll: finisce quando "Cosa faccio" arriva in cima
      const r = trackRef.current.getBoundingClientRect()
      to = MathUtils.clamp(-r.top / document.documentElement.clientHeight, 0, 1)
    }
    progress.current = started.current && scrub ? MathUtils.damp(progress.current, to, 9, Math.min(delta, 0.05)) : to
    started.current = true
    const p = progress.current
    CAM_POS.getPoint(p, _pos)
    CAM_LOOK.getPoint(p, _look)
    // Schermi stretti (telefono, tablet in verticale): la camera arretra per far stare il soggetto in larghezza
    const aspect = size.width / size.height
    const oneColumn = size.width <= 800
    const back = Math.max(1, MathUtils.lerp(FIT.face, oneColumn ? FIT.wideOneColumn : FIT.wideTwoColumns, p) / aspect)
    camera.position.copy(_look).addScaledVector(_pos.sub(_look), back)
    camera.lookAt(_look)
    // Due colonne: viso al centro nella hero, poi la scena scivola nella colonna di sinistra.
    // Una colonna (telefono): resta al centro, e nella hero il viso sale un po' per lasciare spazio ai testi.
    const shiftX = oneColumn ? 0 : SHIFT * MathUtils.smoothstep(p, 0.2, 1)
    const shiftY = oneColumn ? HERO_LIFT * (1 - MathUtils.smoothstep(p, 0, 0.6)) : 0
    camera.setViewOffset(size.width, size.height, shiftX * size.width, shiftY * size.height, size.width, size.height)
    // Una colonna: finita la transizione la scena non resta incollata ma sale via con la pagina, fino a sparire
    const stage = trackRef.current?.querySelector('.scene-stage')
    if (stage) {
      const exit = scrub && oneColumn ? Math.max(0, -trackRef.current.getBoundingClientRect().top - document.documentElement.clientHeight) : 0
      stage.style.transform = exit ? `translateY(${-exit}px)` : ''
    }
  })
  return null
}

const _dofLook = new Vector3()

// Post-processing: occlusione ambientale, bloom leggero, profondita' di campo (solo primo piano), tone mapping, vignettatura, SMAA.
// `low` (telefono, touch o frame rate basso) = niente occlusione, bloom e profondita' di campo
function Post({ low, progress }) {
  const { ao, bloom, dof, vignette, toneMapping } = LOOK.post
  const { enabled: aoOn, nearScale, ...aoProps } = ao
  const aoRef = useRef(null)
  const { enabled: bloomOn, ...bloomProps } = bloom
  const { enabled: dofEnabled, from, until, bokehScale, worldFocusRange } = dof
  const dofRef = useRef(null)
  const [dofOn, setDofOn] = useState(dofEnabled && !low)
  useFrame((state) => {
    const want = dofEnabled && !low && progress.current < until
    if (want !== dofOn) setDofOn(want)
    // Occlusione ambientale ridotta sul viso nel primo piano (nitidezza), piena nel campo lungo (appoggio a terra)
    if (aoRef.current) aoRef.current.configuration.intensity = ao.intensity * MathUtils.lerp(nearScale, 1, MathUtils.smoothstep(progress.current, 0.1, 0.6))
    const e = dofRef.current
    if (!e) return
    // Fuoco sul punto che la camera guarda (il viso nel primo piano); sparisce man mano che ci si allontana
    CAM_LOOK.getPoint(progress.current, _dofLook)
    e.target.copy(_dofLook)
    e.bokehScale = bokehScale * (1 - MathUtils.smoothstep(progress.current, from, until))
  })
  const effects = [
    aoOn && !low && <N8AO key="ao" ref={aoRef} {...aoProps} />,
    bloomOn && !low && <Bloom key="bloom" mipmapBlur {...bloomProps} />,
    dofOn && <DepthOfField key="dof" ref={dofRef} target={[0, 1.36, 0.1]} bokehScale={bokehScale} worldFocusRange={worldFocusRange} />,
    <ToneMapping key="tone" mode={ToneMappingMode[toneMapping]} />,
    <Vignette key="vig" eskil={false} {...vignette} />,
    // SMAA: antialiasing dei bordi (capelli compresi); il multisampling del composer e' a 0 perche' c'e' lui
    LOOK.post.aa === 'smaa' && <SMAA key="smaa" />,
  ].filter(Boolean)
  return (
    <EffectComposer multisampling={LOOK.post.aa === 'msaa' ? 4 : 0} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  )
}

export default function DeskScene({ trackRef, scrub, reduce, onReady }) {
  const progress = useRef(0)
  const [low] = useState(liteDevice) // telefono/touch: fisso, decide la risoluzione
  const [slow, setSlow] = useState(false) // frame rate basso: spegne solo gli effetti pesanti
  // Il render si ferma quando la scena non e' sullo schermo
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (!trackRef.current) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px 0px' })
    io.observe(trackRef.current)
    return () => io.disconnect()
  }, [trackRef])

  return (
    <Canvas
      camera={{ fov: FOV, near: 0.1, far: 40, position: SHOTS[0].pos }}
      dpr={low ? LOOK.dpr.mobile : LOOK.dpr.desktop}
      gl={GL}
      frameloop={!visible ? 'never' : reduce ? 'demand' : 'always'}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* Ambiente quasi nullo: la scena e' scura, il resto lo fanno le luci */}
      <ambientLight intensity={LOOK.ambient} />
      {/* Se il frame rate cala, scende la risoluzione e si spegne l'occlusione ambientale */}
      <PerformanceMonitor bounds={() => [LOOK.perf.minFps, 120]} onDecline={() => setSlow(true)} />
      <Rig trackRef={trackRef} scrub={scrub && !reduce} progress={progress} />
      <Suspense fallback={null}>
        <Models animate={!reduce} progress={progress} onReady={onReady} low={low} />
        {/* Riflessi tenui generati in locale: nessun file da scaricare */}
        <Environment resolution={64} environmentIntensity={LOOK.ambient}>
          <Lightformer intensity={0.5} position={[0, 4, 3]} scale={[8, 3, 1]} />
          <Lightformer intensity={0.6} color="#9d6bff" position={[-4, 1, -3]} scale={[4, 4, 1]} />
          <Lightformer intensity={0.4} color="#ffe2cf" position={[4, 1, 2]} scale={[3, 3, 1]} />
        </Environment>
      </Suspense>
      {LOOK.post.enabled && <Post low={low || slow} progress={progress} />}
    </Canvas>
  )
}
