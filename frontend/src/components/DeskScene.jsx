import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CanvasTexture, CatmullRomCurve3, MathUtils, Matrix4, MeshStandardMaterial, Quaternion, SRGBColorSpace, Vector3 } from 'three'

// Personaggio seduto alla scrivania: testa che segue il mouse, mani che battono, camera legata allo scroll.
// La scena resta ferma sullo schermo dalla hero (viso in primo piano) a "Cosa faccio" (campo lungo sulla scrivania).
// I modelli stanno in frontend/public/models. Unita' in metri, Y in alto, il personaggio guarda verso +Z.
const CHARACTER_URL = '/models/character.glb'
const DESK_URL = '/models/desk-set.glb'

const deg = MathUtils.degToRad
const X = new Vector3(1, 0, 0)
const Y = new Vector3(0, 1, 0)

/* ---------- Posa seduta (regola qui se cambi modello o sedia) ---------- */
const SCALE = 1.2 // il personaggio ha gambe corte: ingrandito perche' i piedi arrivino a terra
const HIPS = new Vector3(0, 0.66, -0.05) // dove finisce l'osso del bacino
const FOOT = { x: 0.12, z: 0.36 } // caviglie: distanza dal centro e in avanti
const WRIST = { x: 0.175, y: 0.83, z: 0.22 } // polsi: sopra il bordo della scrivania, le dita cadono sulla tastiera
const LEAN = deg(12) // busto in avanti

/* ---------- Camera: tre inquadrature percorse con lo scroll ---------- */
const FOV = 30
const SHOTS = [
  { pos: [0, 1.4, 1.95], look: [0, 1.34, 0.1] }, // hero: viso in primo piano, frontale
  { pos: [1.9, 1.75, 2.1], look: [0, 1.0, 0.2] }, // piano medio: busto, mani, monitor
  { pos: [2.95, 2.4, 2.95], look: [0, 0.64, 0.22] }, // campo lungo, tre quarti dall'alto
]
const CAM_POS = new CatmullRomCurve3(SHOTS.map((s) => new Vector3(...s.pos)))
const CAM_LOOK = new CatmullRomCurve3(SHOTS.map((s) => new Vector3(...s.look)))
const SHIFT = 0.22 // nel campo lungo la scena si sposta a sinistra di questa frazione di schermo (colonna di "Cosa faccio")
const DESK_IN = [0.04, 0.3] // tratto di scroll in cui compaiono scrivania, sedia e tastiera
const MONITOR_IN = [0.32, 0.58] // il monitor arriva dopo, quando la camera si e' spostata di lato: di fronte coprirebbe il viso

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
    const to = basisQuat(new Vector3(-s * 0.1, -0.16, 1), new Vector3(0, -1, 0))
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
  grad.addColorStop(0, 'rgba(236, 226, 255, 0.55)')
  grad.addColorStop(0.35, 'rgba(190, 160, 255, 0.2)')
  grad.addColorStop(1, 'rgba(160, 120, 255, 0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
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

function Models({ animate, progress, onReady }) {
  const character = useGLTF(CHARACTER_URL).scene
  const desk = useGLTF(DESK_URL).scene
  const invalidate = useThree((s) => s.invalidate)
  const pointer = usePointer()
  const rig = useRef(null)
  const look = useRef({ yaw: 0, pitch: 0 })
  const halo = useMemo(makeHalo, [])
  const haloMat = useRef()
  const glow = useRef()
  const deskMats = useRef([])
  const monitorMats = useRef([])

  useLayoutEffect(() => {
    rig.current = sit(character)
    // La posa cambia la sagoma: senza questo la mesh sparirebbe quando la sagoma originale esce dall'inquadratura
    character.traverse((o) => {
      if (o.isSkinnedMesh) o.frustumCulled = false
    })
    // Schermo acceso: rosa/magenta
    const screen = desk.getObjectByName('monitor_screen')
    if (screen) {
      screen.material.dispose()
      screen.material = new MeshStandardMaterial({ color: '#1a0614', emissive: '#ff4fd0', emissiveIntensity: 1.6, toneMapped: false })
    }
    // Materiali separati per il monitor, cosi' puo' comparire in un momento diverso dal resto
    const body = desk.getObjectByName('monitor_body')
    if (body) body.material = body.material.clone()
    const mats = new Set()
    const monitor = new Set()
    desk.traverse((o) => o.material && (o.name.startsWith('monitor') ? monitor : mats).add(o.material))
    deskMats.current = [...mats]
    monitorMats.current = [...monitor]
    invalidate()
    onReady?.()
    return () => {
      disposeTree(character)
      disposeTree(desk)
      useGLTF.clear([CHARACTER_URL, DESK_URL])
    }
  }, [character, desk, invalidate, onReady])

  useEffect(() => () => halo.dispose(), [halo])

  useFrame((state, delta) => {
    // Scrivania, sedia e alone compaiono mentre la camera si allontana dal viso
    const show = MathUtils.smoothstep(progress.current, DESK_IN[0], DESK_IN[1])
    const showMonitor = MathUtils.smoothstep(progress.current, MONITOR_IN[0], MONITOR_IN[1])
    desk.visible = show > 0.001
    for (const [list, o] of [[deskMats.current, show], [monitorMats.current, showMonitor]]) {
      for (const m of list) {
        m.transparent = o < 1
        m.opacity = o
      }
    }
    if (haloMat.current) haloMat.current.opacity = show
    if (glow.current) glow.current.intensity = 0.4 * showMonitor

    const r = rig.current
    if (!r || !animate) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    // A. Testa: segue il mouse; senza mouse torna al centro con un piccolo movimento
    const p = pointer.current
    const yawTo = p.active ? p.x * deg(35) : Math.sin(t * 0.5) * deg(4)
    const pitchTo = p.active ? -p.y * deg(20) : Math.sin(t * 0.37) * deg(2)
    const l = look.current
    l.yaw = MathUtils.damp(l.yaw, yawTo, 5, dt)
    l.pitch = MathUtils.damp(l.pitch, pitchTo, 5, dt)
    for (const [part, share] of [[r.neck, 0.3], [r.head, 0.7]]) {
      _yaw.setFromAxisAngle(Y, l.yaw * share)
      _pitch.setFromAxisAngle(X, l.pitch * share)
      // la testa e' figlia del collo: il suo "genitore" si e' appena mosso
      const parentW = part === r.head ? _pw.copy(r.neck.parentW).multiply(r.neck.bone.quaternion) : part.parentW
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
      {/* Bagliore dello schermo su viso e mani */}
      <pointLight ref={glow} position={[0, 1.08, 0.52]} intensity={0} distance={1.8} color="#ff4fd0" />
      {/* Alone chiaro sul pavimento sotto la scrivania */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0.3]}>
        <planeGeometry args={[3.2, 3.2]} />
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
      const r = trackRef.current.getBoundingClientRect()
      const span = r.height - window.innerHeight
      to = span > 0 ? MathUtils.clamp(-r.top / span, 0, 1) : 0
    }
    progress.current = started.current && scrub ? MathUtils.damp(progress.current, to, 9, Math.min(delta, 0.05)) : to
    started.current = true
    const p = progress.current
    CAM_POS.getPoint(p, _pos)
    CAM_LOOK.getPoint(p, _look)
    // Schermi stretti (mobile): la camera arretra per far stare il soggetto
    const back = Math.max(1, 1.05 / (size.width / size.height))
    camera.position.copy(_look).addScaledVector(_pos.sub(_look), back)
    camera.lookAt(_look)
    // Viso al centro nella hero; allontanandosi la scena scivola nella colonna di sinistra
    const shift = SHIFT * MathUtils.smoothstep(p, 0.2, 1)
    camera.setViewOffset(size.width, size.height, shift * size.width, 0, size.width, size.height)
  })
  return null
}

export default function DeskScene({ trackRef, scrub, reduce, onReady }) {
  const progress = useRef(0)
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
      dpr={[1, 2]}
      frameloop={!visible ? 'never' : reduce ? 'demand' : 'always'}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <hemisphereLight args={['#cfc8ff', '#0b0b0e', 0.3]} />
      {/* Luce chiave morbida frontale */}
      <directionalLight position={[1.4, 2.6, 2.6]} intensity={1.5} color="#fff1e6" />
      {/* Accento viola dal basso e da dietro, piu' un controluce sulla testa */}
      <pointLight position={[-0.5, 0.15, -0.9]} intensity={9} distance={5} color="#9d6bff" />
      <pointLight position={[0.7, 1.7, -1.1]} intensity={6} distance={4} color="#b79cff" />
      <Rig trackRef={trackRef} scrub={scrub && !reduce} progress={progress} />
      <Suspense fallback={null}>
        <Models animate={!reduce} progress={progress} onReady={onReady} />
        {/* Riflessi generati in locale: nessun file da scaricare */}
        <Environment resolution={64}>
          <Lightformer intensity={0.5} position={[0, 4, 3]} scale={[8, 3, 1]} />
          <Lightformer intensity={0.6} color="#9d6bff" position={[-4, 1, -3]} scale={[4, 4, 1]} />
          <Lightformer intensity={0.4} color="#ff4fd0" position={[4, 1, 2]} scale={[3, 3, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  )
}
