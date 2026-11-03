import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

// Avvolge un elemento e lo attira leggermente verso il mouse quando è vicino.
export default function Magnetic({ children, strength = 0.35 }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 })

  const move = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const leave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span style={{ x: sx, y: sy, display: 'inline-block' }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </motion.span>
  )
}
