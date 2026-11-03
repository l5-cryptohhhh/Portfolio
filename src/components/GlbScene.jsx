import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box3, MathUtils, Vector3 } from 'three'

// Controlla se il file esiste davvero (in dev Vite risponde con HTML se manca)
function useFileExists(url) {
  const [exists, setExists] = useState(null)
  useEffect(() => {
    fetch(url, { method: 'HEAD' })
      .then((r) => setExists(r.ok && !(r.headers.get('content-type') || '').includes('text/html')))
      .catch(() => setExists(false))
  }, [url])
  return exists
}

// Posizione del mouse (-1..1) letta dalla finestra, così funziona anche sotto altri elementi
function useWindowPointer() {
  const p = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const move = (e) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return p
}

function Model({ url, size, pointer, maxYaw }) {
  const { scene } = useGLTF(url)
  const group = useRef()

  useLayoutEffect(() => {
    const box = new Box3().setFromObject(scene)
    const dim = box.getSize(new Vector3())
    const c = box.getCenter(new Vector3())
    const s = size / Math.max(dim.y, dim.x, 0.0001)
    scene.scale.setScalar(s)
    scene.position.set(-c.x * s, -c.y * s, -c.z * s)
  }, [scene, size])

  useFrame(() => {
    if (!group.current) return
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, pointer.current.x * maxYaw, 0.06)
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, -pointer.current.y * 0.12, 0.06)
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

// Segnaposto: piano di scrivania con due gambe e un monitor
function Placeholder({ pointer, maxYaw }) {
  const group = useRef()
  useFrame(() => {
    if (!group.current) return
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, pointer.current.x * maxYaw, 0.06)
  })
  return (
    <group ref={group}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.12, 1.2]} />
        <meshStandardMaterial color="#e8e6f2" />
      </mesh>
      <mesh position={[-1, -0.8, 0]}>
        <boxGeometry args={[0.1, 1.6, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1, -0.8, 0]}>
        <boxGeometry args={[0.1, 1.6, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.5, 0.7, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.06]} />
        <meshStandardMaterial color="#c4f25b" emissive="#3d5210" />
      </mesh>
    </group>
  )
}

// Carica un GLB da /public e lo fa ruotare leggermente verso il mouse.
// Se il file non esiste, mostra un segnaposto.
export default function GlbScene({ url, size = 3.6, maxYaw = 0.35 }) {
  const exists = useFileExists(url)
  const pointer = useWindowPointer()
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 40 }} dpr={[1, 2]}>
      <hemisphereLight args={['#ffffff', '#2a1f4d', 1]} />
      <directionalLight position={[3, 4, 5]} intensity={2} color="#c8a8ff" />
      <Suspense fallback={null}>
        {exists === true && <Model url={url} size={size} pointer={pointer} maxYaw={maxYaw} />}
        {exists === false && <Placeholder pointer={pointer} maxYaw={maxYaw} />}
        <Environment resolution={256}>
          <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 4, 1]} />
          <Lightformer intensity={1.6} color="#c4f25b" position={[-5, 1, 2]} scale={[4, 4, 1]} />
          <Lightformer intensity={1.2} color="#d8e4ff" position={[5, 1, 2]} scale={[4, 4, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  )
}
