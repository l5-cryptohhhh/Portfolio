import { lazy, Suspense, useEffect, useRef } from 'react'
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

// Sezioni con scene 3D: caricate a pezzi (code splitting) per alleggerire il primo caricamento
const Hero = lazy(() => import('./components/Hero.jsx'))
const WhatIDo = lazy(() => import('./components/WhatIDo.jsx'))
const loadTechStack = () => import('./components/TechStack.jsx')
const TechStack = lazy(loadTechStack)
// Scarica il chunk (three + rapier) in background appena il browser e' libero, cosi' e' gia' pronto quando si scrolla
if (typeof window !== 'undefined') {
  const prefetch = () => loadTechStack()
  window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(prefetch) : setTimeout(prefetch, 1500)), { once: true })
}

gsap.registerPlugin(ScrollTrigger)

const NAV = [
  { label: 'About', hash: '#about' },
  { label: 'Experience', hash: '#experience' },
  { label: 'Work', hash: '#work' },
  { label: 'Contact', hash: '#contact' },
]

export default function App() {
  const lenisRef = useRef(null)
  const finePointer = useMedia('(hover: hover) and (pointer: fine)')
  const reduceMotion = useMedia('(prefers-reduced-motion: reduce)')

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
    const lenis = lenisRef.current
    if (!lenis) return
    const el = document.querySelector(hash)
    if (!el) return
    e.preventDefault()
    lenis.scrollTo(el, { duration: 1.4 })
  }

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progress }} />
      {/* Cursore custom: solo con mouse (non su touch) */}
      {finePointer && <TargetCursor spinDuration={2} cursorColor="#c4f25b" cursorColorOnTarget="#c4f25b" parallaxOn hideDefaultCursor />}
      <nav className="nav" aria-label="Principale">
        <a className="nav-brand cursor-target" href="#home" onClick={(e) => go(e, '#home')}>{profile.brand}</a>
        <a className="nav-mail cursor-target" href={`mailto:${contacts.email}`}>{contacts.email}</a>
        <div>
          {NAV.map((n) => (
            <a key={n.hash} className="cursor-target" href={n.hash} onClick={(e) => go(e, n.hash)}>
              {n.label}
            </a>
          ))}
        </div>
      </nav>
      <main>
        <Suspense fallback={<section className="hero" id="home" />}>
          <Hero />
        </Suspense>
        <LazyOnView>
          <WhatIDo />
        </LazyOnView>
        <Marquee />
        <About />
        <Experience />
        <Work />
        <LazyOnView rootMargin="3000px 0px">
          <TechStack />
        </LazyOnView>
        <Contact />
      </main>
    </>
  )
}
