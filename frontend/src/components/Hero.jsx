import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box3, MathUtils, Vector3 } from 'three'
import Reveal from './Reveal.jsx'
import SplitFlapText from './SplitFlapText.jsx'
import SocialIcons from './SocialIcons.jsx'
import { profile } from '../data/profile.js'

// Parole del tabellone (in maiuscolo) e numero di tessere = parola piu' lunga
const ROLE_WORDS = profile.roles.map((r) => r.toUpperCase())
const ROLE_WIDTH = Math.max(...ROLE_WORDS.map((r) => r.length))

// Nome su due righe: prima parola / resto (es. "TUO" / "NOME")
const [firstName, ...restName] = profile.name.toUpperCase().split(' ')
const NAME_LINES = restName.length ? [firstName, restName.join(' ')] : [firstName]

// Metti il tuo modello in /frontend/public/avatar.glb: viene usato in automatico.
// Se il file non c'è, compare un segnaposto.
const GLB_URL = '/avatar.glb'

// Il modello segue il mouse con una molla morbida e "respira" quando sei fermo.
function useLookAtMouse(target, strength = 1, idle = 0) {
  useFrame((state) => {
    if (!target.current) return
    const { x, y } = state.pointer
    const t = state.clock.elapsedTime
    target.current.rotation.y = MathUtils.lerp(target.current.rotation.y, x * 0.6 * strength, 0.07)
    target.current.rotation.x = MathUtils.lerp(target.current.rotation.x, -y * 0.25 * strength, 0.07)
    if (idle) target.current.position.y = Math.sin(t * 1.2) * idle
  })
}

function GlbAvatar() {
  const { scene } = useGLTF(GLB_URL)
  const group = useRef()
  const head = useRef(null)

  // Centra e scala il modello (i GLB generati da foto hanno dimensioni imprevedibili)
  useLayoutEffect(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const s = 3.4 / Math.max(size.y, 0.0001)
    scene.scale.setScalar(s)
    scene.position.set(-center.x * s, -center.y * s, -center.z * s)
    head.current = scene.getObjectByName('Head') || null
  }, [scene])

  // Se c'è una testa separata ruota solo quella, altrimenti ruota tutto il modello
  useFrame((state) => {
    const t = head.current || group.current
    if (!t) return
    const { x, y } = state.pointer
    const k = head.current ? 1 : 0.5
    t.rotation.y = MathUtils.lerp(t.rotation.y, x * 0.6 * k, 0.07)
    t.rotation.x = MathUtils.lerp(t.rotation.x, -y * 0.25 * k, 0.07)
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

function Placeholder() {
  const ref = useRef()
  useLookAtMouse(ref, 1, 0.06)
  return (
    <group ref={ref}>
      <mesh position={[0, -1.4, 0]}>
        <capsuleGeometry args={[0.9, 0.8, 8, 24]} />
        <meshStandardMaterial color="#1c1c24" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.85, 48, 48]} />
        <meshStandardMaterial color="#c9a68a" roughness={0.5} />
      </mesh>
    </group>
  )
}

// Controlla se /avatar.glb esiste davvero (in dev Vite risponde con HTML se manca)
function useGlbExists(url) {
  const [exists, setExists] = useState(null)
  useEffect(() => {
    fetch(url, { method: 'HEAD' })
      .then((r) => setExists(r.ok && !(r.headers.get('content-type') || '').includes('text/html')))
      .catch(() => setExists(false))
  }, [url])
  return exists
}

export default function Hero() {
  const exists = useGlbExists(GLB_URL)
  const reduce = useReducedMotion()
  const ref = useRef()

  // Parallax: i due testi si separano mentre scorri via dall'hero
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90])
  const yRight = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -150])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section className="hero" id="home" ref={ref}>
      <motion.div className="hero-text left" style={{ y: yLeft, opacity: fade }}>
        <motion.small
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.8, delay: 0.1 }}
        >
          {profile.heroIntro}
        </motion.small>
        <Reveal as="h1" lines={NAME_LINES} delay={0.2} />
      </motion.div>
      <motion.div className="hero-text right" style={{ y: yRight, opacity: fade }}>
        <motion.small
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.8, delay: 0.3 }}
        >
          {profile.tagline}
        </motion.small>
        {/* Tabellone a lamelle: tessere scure, lettere lime. La larghezza si adatta alla parola piu' lunga. */}
        <h2>
          <SplitFlapText
            className="hero-flap"
            words={ROLE_WORDS}
            padTo={ROLE_WIDTH}
            align="right"
            order="left"
            tileStyle="board"
            tileColor="#17171d"
            textColor="#c4f25b"
            flipDuration={0.1}
            stagger={0.05}
            flipsPerChar={6}
            cycleDelay={2800}
            charset="alpha"
            glare={0.25}
            depth={0.6}
            tileRadius={6}
            gap={4}
            fontSize="clamp(20px, 2.4vw, 40px)"
          />
        </h2>
      </motion.div>
      <SocialIcons className="hero-socials" />
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 2]}>
        <hemisphereLight args={['#ffffff', '#1a1a22', 0.9]} />
        <directionalLight position={[3, 4, 5]} intensity={2} color="#f4ffd6" />
        <Suspense fallback={null}>
          {exists === true && <GlbAvatar />}
          {exists === false && <Placeholder />}
          {/* Illuminazione ambientale generata in locale: nessun file da scaricare */}
          <Environment resolution={256}>
            <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 4, 1]} />
            <Lightformer intensity={1.6} color="#c4f25b" position={[-5, 1, 2]} scale={[4, 4, 1]} />
            <Lightformer intensity={1.2} color="#d8e4ff" position={[5, 1, 2]} scale={[4, 4, 1]} />
          </Environment>
        </Suspense>
      </Canvas>
    </section>
  )
}
