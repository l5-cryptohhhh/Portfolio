import { motion, useReducedMotion } from 'motion/react'
import Reveal from './Reveal.jsx'
import { profile } from '../data/profile.js'

// Iniziali per il riquadro segnaposto quando non c'e' ancora una foto
const initials = profile.name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0].toUpperCase())
  .join('')

export default function About() {
  const reduce = useReducedMotion()
  const rise = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-12%' },
    transition: { type: 'spring', bounce: 0, duration: 0.9, delay },
  })

  return (
    <section className="about" id="about">
      <motion.figure className="about-photo" {...rise()}>
        {profile.photo ? (
          <img src={profile.photo} alt={profile.photoAlt} loading="lazy" />
        ) : (
          <div className="about-photo-empty" role="img" aria-label="Spazio per la tua foto">
            <span>{initials}</span>
          </div>
        )}
      </motion.figure>
      <div className="about-body">
        <Reveal as="h2" className="about-title" lines={['ABOUT', 'ME']} accent={[1]} />
        <motion.p className="about-lead" {...rise(0.1)}>{profile.headline}</motion.p>
        {profile.bio.map((text, i) => (
          <motion.p className="about-text" key={i} {...rise(0.18 + i * 0.08)}>{text}</motion.p>
        ))}
        {profile.location && <motion.p className="about-meta" {...rise(0.3)}>{profile.location}</motion.p>}
      </div>
    </section>
  )
}
