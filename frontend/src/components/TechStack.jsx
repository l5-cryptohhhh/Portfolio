import { Canvas, useFrame } from '@react-three/fiber'
import { Physics, RigidBody, BallCollider } from '@react-three/rapier'
import { Decal, Environment, Lightformer } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { CanvasTexture, Color, MathUtils, SRGBColorSpace, Vector3 } from 'three'
import { tech as TECH } from '../data/tech.js'
import { ICONS } from './techIcons.js'
import Reveal from './Reveal.jsx'

// Disegna il logo + il nome sul canvas. `svg` e' l'immagine di frontend/public/icons (se c'e'), altrimenti si usa il logo di ripiego.
function paint(g, { label, fallback, svg }) {
  g.clearRect(0, 0, 512, 512)
  if (svg) {
    const w0 = svg.naturalWidth || 270
    const h0 = svg.naturalHeight || 270
    const k = Math.min(270 / w0, 270 / h0)
    g.drawImage(svg, 256 - (w0 * k) / 2, 215 - (h0 * k) / 2, w0 * k, h0 * k)
  } else if (fallback) {
    const s = 270 / 24 // le icone Simple Icons sono su una griglia 24x24
    g.save()
    g.translate(256 - 12 * s, 215 - 12 * s)
    g.scale(s, s)
    g.fillStyle = `#${fallback.hex}`
    g.fill(new Path2D(fallback.path))
    g.restore()
  }
  g.fillStyle = '#17171d'
  g.font = "700 84px Outfit, system-ui, sans-serif"
  g.textAlign = 'center'
  g.fillText(label, 256, 438)
}

// Crea l'adesivo (decal) della pallina. Parte subito con il logo di ripiego; se in frontend/public/icons/<icon>.svg
// esiste un file, lo carica e ridisegna la texture appena e' pronto.
function makeTexture(item) {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')
  const base = { label: item.label, fallback: ICONS[item.icon] }
  paint(g, base)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.flipY = false // le UV del decal sono già capovolte: senza questo il logo esce a testa in giù
  t.anisotropy = 8

  let svg = null
  const redraw = () => {
    paint(g, { ...base, svg })
    t.needsUpdate = true
  }
  // Il font arriva dopo la prima pittura: ridisegna il nome quando e' pronto
  document.fonts?.load('700 84px Outfit').then(redraw).catch(() => {})

  const img = new Image()
  img.onload = () => {
    svg = img
    redraw()
  }
  img.src = `/icons/${item.icon}.svg` // se il file manca l'immagine fallisce in silenzio e resta il ripiego
  return t
}

const REACH = 3 // raggio d'azione del mouse
const ATTRACT = 0.35 // quanto le palline tornano verso il centro (basso = si sparpagliano)

function Ball({ tech, position, active }) {
  const body = useRef()
  const skin = useRef()
  const v = useMemo(() => new Vector3(), [])
  const map = useMemo(() => makeTexture(tech), [tech])
  // La pallina prende una sfumatura leggerissima del colore del brand (i brand neri restano bianchi)
  const tint = useMemo(() => {
    const base = new Color('#f3f2ee')
    const hex = tech.color || ICONS[tech.icon]?.hex
    return !hex || hex === '000000' ? base : base.lerp(new Color(`#${hex}`), 0.16)
  }, [tech])

  // Ogni sfera viene attirata verso il centro; il puntatore la respinge con una spinta morbida
  useFrame((state) => {
    if (!body.current) return
    const p = body.current.translation()
    // Richiamo verso il centro, più debole in orizzontale così riempiono tutta la larghezza
    v.set(-p.x * 0.55, -p.y, 0).multiplyScalar(ATTRACT)
    body.current.applyImpulse({ x: v.x * 0.02, y: v.y * 0.02, z: 0 }, true)

    // Il mouse spazza via le palline vicine: più sei vicino, più forte è la spinta
    let near = false
    if (active.current) {
      const mx = (state.pointer.x * state.viewport.width) / 2
      const my = (state.pointer.y * state.viewport.height) / 2
      const dx = p.x - mx
      const dy = p.y - my
      const d = Math.hypot(dx, dy)
      near = d < REACH
      if (near && d > 0.001) {
        const push = (1 - d / REACH) * 0.3
        body.current.applyImpulse({ x: (dx / d) * push, y: (dy / d) * push, z: 0 }, true)
      }
    }
    // La pallina "si gonfia" appena il mouse è vicino
    if (skin.current) {
      const k = MathUtils.lerp(skin.current.scale.x, near ? 1.1 : 1, 0.12)
      skin.current.scale.setScalar(k)
    }
  })

  return (
    <RigidBody
      ref={body}
      position={position}
      colliders={false}
      linearDamping={1.4}
      restitution={0.35}
      enabledRotations={[false, false, false]} // il logo resta sempre rivolto verso di te
      enabledTranslations={[true, true, false]} // tutte sullo stesso piano: nessuna ne copre un'altra
    >
      <BallCollider args={[0.7]} />
      <mesh ref={skin}>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshStandardMaterial color={tint} roughness={0.3} metalness={0.05} />
        <Decal position={[0, 0, 0.62]} scale={1.15}>
          <meshBasicMaterial map={map} transparent polygonOffset polygonOffsetFactor={-10} toneMapped={false} />
        </Decal>
      </mesh>
    </RigidBody>
  )
}

export default function TechStack() {
  // Griglia 4x4 leggermente sfalsata: partono già separate e senza sovrapposizioni
  const positions = useMemo(
    () =>
      TECH.map((_, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        return [(col - 1.5) * 2.6 + (Math.random() - 0.5) * 0.4, (1.5 - row) * 1.9 + (Math.random() - 0.5) * 0.4, 0]
      }),
    []
  )
  const active = useRef(false) // il mouse è sopra la sezione?
  return (
    <section
      className="stack"
      onPointerEnter={() => (active.current = true)}
      onPointerLeave={() => (active.current = false)}
    >
      <Reveal as="h2" className="stack-title" lines={['MY', 'TECHSTACK']} accent={[1]} />
      <Canvas camera={{ position: [0, 0, 14], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.8} color="#fffdf2" />
        <Environment resolution={128}>
          <Lightformer intensity={2} position={[0, 5, 5]} scale={[10, 4, 1]} />
          <Lightformer intensity={1} color="#c4f25b" position={[-6, 0, 3]} scale={[4, 6, 1]} />
        </Environment>
        <Physics gravity={[0, 0, 0]}>
          {TECH.map((t, i) => (
            <Ball key={t.label} tech={t} position={positions[i]} active={active} />
          ))}
        </Physics>
      </Canvas>
    </section>
  )
}
