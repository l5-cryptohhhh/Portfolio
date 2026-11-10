import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import Reveal from './Reveal.jsx'
import { experience } from '../data/experience.js'
import { useLang } from '../i18n.jsx'

// Timeline delle esperienze. La linea si riempie mentre scorri: mostra quanto manca alla fine.
export default function Experience() {
  const { t, tr } = useLang()
  const reduce = useReducedMotion()
  const list = useRef(null)
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 75%', 'end 65%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })

  return (
    <section className="experience" id="experience">
      <Reveal as="h2" className="experience-title" lines={t.titles.experience} accent={[1]} />
      <ol className="timeline" ref={list}>
        <span className="timeline-rail" aria-hidden="true">
          <motion.span className="timeline-fill" style={{ scaleY: reduce ? 1 : fill }} />
        </span>
        {experience.map((job, i) => (
          <motion.li
            className="timeline-item"
            key={i}
            initial={reduce ? false : { opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.9, delay: 0.05 }}
          >
            <span className="timeline-period">{tr(job.period)}</span>
            <div className="timeline-body">
              <h3>{tr(job.role)}</h3>
              {job.company && <p className="timeline-company">{tr(job.company)}</p>}
              <p className="timeline-text">{tr(job.description)}</p>
              {job.tools?.length > 0 && (
                <ul className="chips" aria-label={t.toolsUsed}>
                  {job.tools.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
