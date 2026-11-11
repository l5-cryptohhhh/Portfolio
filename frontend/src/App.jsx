import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useScroll, useSpring } from 'motion/react'
import TargetCursor from './components/TargetCursor.jsx'
import Marquee from './components/Marquee.jsx'
import About from './components/About.jsx'
import Experience from './components/Experience.jsx'
import Work from './components/Work.jsx'
import Contact from './components/Contact.jsx'
import LazyOnView from './components/LazyOnView.jsx'
import useMedia from './hooks/useMedia.js'
import { contacts } from './data/contacts.js'
import { profile } from './data/profile.js'
import { useLang } from './i18n.jsx'

// Sezioni con scene 3D: caricate a pezzi (code splitting) per alleggerire il primo caricamento
const Hero = lazy(() => import('./components/Hero.jsx'))
const WhatIDo = lazy(() => import('./components/WhatIDo.jsx'))
// La scena 3D (chunk + modelli) parte a scaricarsi subito, mentre l'utente e' ancora sulla schermata PLAY
const loadDeskScene = () => import('./components/DeskScene.jsx')
const DeskScene = lazy(loadDeskScene)
if (typeof window !== 'undefined') loadDeskScene()
const loadTechStack = () => import('./components/TechStack.jsx')
const TechStack = lazy(loadTechStack)
// Scarica il chunk (three + rapier) in background appena il browser e' libero, cosi' e' gia' pronto quando si scrolla
if (typeof window !== 'undefined') {
  const prefetch = () => loadTechStack()
  window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(prefetch) : setTimeout(prefetch, 1500)), { once: true })
}

gsap.registerPlugin(ScrollTrigger)

const NAV = [
  { key: 'about', hash: '#about' },
  { key: 'experience', hash: '#experience' },
  { key: 'work', hash: '#work' },
  { key: 'contact', hash: '#contact' },
]

export default function App({ entered = true, onReady }) {
  const { lang, setLang, t } = useLang()
  const lenisRef = useRef(null)
  const finePointer = useMedia('(hover: hover) and (pointer: fine)')
  const reduceMotion = useMedia('(prefers-reduced-motion: reduce)')
  // Scena 3D: resta ferma sullo schermo dalla hero a "Cosa faccio" e la camera segue lo scroll, a ogni larghezza.
  // Solo con "riduci movimento" sta nella hero con inquadratura fissa sul viso.
  const sceneScroll = !reduceMotion
  const sceneTrack = useRef(null)
  const [sceneReady, setSceneReady] = useState(false)
  const onSceneReady = useCallback(() => {
    setSceneReady(true)
    onReady?.()
  }, [onReady])
  // Menu a scomparsa (solo telefono): mentre e' aperto la pagina sotto non scorre
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!menuOpen) return
    const lenis = lenisRef.current
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', esc)
    return () => {
      lenis?.start()
      document.body.style.overflow = prev
      window.removeEventListener('keydown', esc)
    }
  }, [menuOpen])
  // Tornando a una finestra larga il menu si chiude da solo
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 801px)')
    const close = () => mq.matches && setMenuOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [])

  // Barra di avanzamento: dice a che punto sei della pagina
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 })

  // Smooth scroll (Lenis) agganciato a ScrollTrigger (GSAP). Spento con "riduci movimento".
  useEffect(() => {
    if (reduceMotion) return
    const lenis = new Lenis({ lerp: 0.09 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduceMotion])

  // Navigazione: scorre con Lenis. Con "riduci movimento" Lenis e' spento e resta il salto nativo dell'ancora.
  const go = (e, hash) => {
    setMenuOpen(false)
    const lenis = lenisRef.current
    if (!lenis) return
    const el = document.querySelector(hash)
    if (!el) return
    e.preventDefault()
    // Il menu si sta chiudendo: Lenis riparte (effect sopra) e solo dopo scorre verso la sezione
    setTimeout(() => lenis.scrollTo(el, { duration: 1.4 }), 0)
  }
  const langSwitch = (
    <span className="lang" role="group" aria-label={t.langLabel}>
      {['it', 'en'].map((l) => (
        <button key={l} type="button" className="cursor-target" aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </span>
  )

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progress }} />
      {/* Cursore custom: solo con mouse (non su touch) */}
      {entered && finePointer && <TargetCursor spinDuration={2} cursorColor="#c4f25b" cursorColorOnTarget="#c4f25b" parallaxOn hideDefaultCursor />}
      <nav className="nav" aria-label={t.navLabel}>
        <span className="nav-left">
          <a className="nav-brand cursor-target" href="#home" onClick={(e) => go(e, '#home')}>
            <img src="/logo.png" alt="" width="56" height="56" />
            {profile.brand}
          </a>
          <a className="nav-mail cursor-target" href={`mailto:${contacts.email}`}>{contacts.email}</a>
        </span>
        <div className="nav-links">
          {NAV.map((n) => (
            <a key={n.hash} className="cursor-target" href={n.hash} onClick={(e) => go(e, n.hash)}>
              {t.nav[n.key]}
            </a>
          ))}
          {langSwitch}
        </div>
        <button
          type="button"
          className="nav-burger"
          aria-label={menuOpen ? t.menuClose : t.menuOpen}
          aria-expanded={menuOpen}
          aria-controls="menu-panel"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </nav>
      {/* Telefono: pannello a tutto schermo con le sezioni. Sta fuori dalla nav perche' la nav usa mix-blend-mode */}
      <div className={menuOpen ? 'menu-panel is-open' : 'menu-panel'} id="menu-panel" inert={!menuOpen ? '' : undefined}>
        {NAV.map((n) => (
          <a key={n.hash} href={n.hash} onClick={(e) => go(e, n.hash)}>
            {t.nav[n.key]}
          </a>
        ))}
        {langSwitch}
      </div>
      <main>
        <div className={sceneScroll ? 'scene-track is-scroll' : 'scene-track'} ref={sceneTrack}>
          <div className="scene-stage" aria-hidden="true">
            {/* Segnaposto leggero finche' i modelli non sono pronti */}
            <div className={sceneReady ? 'scene-fallback is-hidden' : 'scene-fallback'} />
            <Suspense fallback={null}>
              <DeskScene trackRef={sceneTrack} scrub={sceneScroll} reduce={reduceMotion} onReady={onSceneReady} />
            </Suspense>
          </div>
          <Suspense fallback={<section className="hero" id="home" />}>
            <Hero />
          </Suspense>
          <LazyOnView>
            <WhatIDo />
          </LazyOnView>
        </div>
        <Marquee />
        <About />
        <Experience />
        <Work />
        <LazyOnView rootMargin="3000px 0px" idle>
          <TechStack />
        </LazyOnView>
        <Contact />
      </main>
    </>
  )
}
