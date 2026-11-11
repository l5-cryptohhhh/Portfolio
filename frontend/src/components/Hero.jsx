import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import Reveal from './Reveal.jsx'
import SplitFlapText from './SplitFlapText.jsx'
import SocialIcons from './SocialIcons.jsx'
import { profile } from '../data/profile.js'
import { useLang } from '../i18n.jsx'

// Parole del tabellone (in maiuscolo) e numero di tessere = parola piu' lunga
const ROLE_WORDS = profile.roles.map((r) => r.toUpperCase())
const ROLE_WIDTH = Math.max(...ROLE_WORDS.map((r) => r.length))

// Nome su due righe: prima parola / resto (es. "TUO" / "NOME")
const [firstName, ...restName] = profile.name.toUpperCase().split(' ')
const NAME_LINES = restName.length ? [firstName, restName.join(' ')] : [firstName]

// Il personaggio 3D (viso in primo piano) sta nella scena fissa dietro la hero: vedi DeskScene.jsx e App.jsx
export default function Hero() {
  const { tr } = useLang()
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
          {tr(profile.heroIntro)}
        </motion.small>
        <Reveal as="h1" lines={NAME_LINES} delay={0.2} />
      </motion.div>
      <motion.div className="hero-text right" style={{ y: yRight, opacity: fade }}>
        <motion.small
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.8, delay: 0.3 }}
        >
          {tr(profile.tagline)}
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
      <SocialIcons className="hero-socials" fade />
    </section>
  )
}
