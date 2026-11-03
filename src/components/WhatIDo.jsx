import { motion, useReducedMotion } from 'motion/react'
import GlbScene from './GlbScene.jsx'
import Reveal from './Reveal.jsx'

import { profile } from '../data/profile.js'

// Metti la scena (personaggio alla scrivania) in /public/desk.glb
const items = profile.services

export default function WhatIDo() {
  const reduce = useReducedMotion()
  return (
    <section className="what">
      <div className="what-3d">
        <GlbScene url="/desk.glb" />
        <Reveal as="h2" className="what-title" lines={['WHAT', 'I DO']} accent={[1]} />
      </div>
      <div className="what-list">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            className="bracket cursor-target"
            initial={reduce ? false : { opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.9, delay: i * 0.12 }}
          >
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
