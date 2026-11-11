import { useEffect, useRef, useState } from 'react'
import CircularText from './CircularText.jsx'
import { profile } from '../data/profile.js'
import './Loader.css'

const DURATION = 3400 // ms: durata minima del caricamento
const MAX_WAIT = 25000 // ms: oltre questo tempo la schermata se ne va comunque, anche se la scena 3D non e' pronta

// Easing con qualche rallentamento, cosi' sembra un caricamento vero.
const curve = (p) => {
  const s = p * p * (3 - 2 * p)
  return Math.min(1, s * 0.85 + p * 0.15)
}

// Schermata iniziale: tasto PLAY al centro. Al click parte un caricamento finto fino al 100%
// (intanto il sito vero si monta dietro e si stabilizza), poi la schermata sparisce.
// Diametro dell'anello di testo: quasi tutta l'altezza della pagina (o la larghezza, se piu' stretta)
const ringSize = () => Math.round(Math.min(window.innerHeight, window.innerWidth) * 0.92)

export default function Loader({ started, sceneReady = true, onStart, onDone }) {
  const [size, setSize] = useState(ringSize)
  useEffect(() => {
    const onResize = () => setSize(ringSize())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const done = useRef(onDone)
  done.current = onDone
  const ready = useRef(sceneReady)
  ready.current = sceneReady

  useEffect(() => {
    if (!started) return
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / DURATION)
      // Il 100% arriva solo quando il personaggio 3D e' gia' disegnato: prima resta a 99%
      const waiting = p >= 1 && !ready.current && now - t0 < MAX_WAIT
      setPct(waiting ? 99 : Math.round(curve(p) * 100))
      if (p < 1 || waiting) raf = requestAnimationFrame(tick)
      else {
        setLeaving(true)
        setTimeout(() => done.current(), 600)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started])

  return (
    <div className={`loader${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      {/* Stessa posizione e stile del brand nella navbar vera */}
      <div className="nav loader-nav" aria-hidden="true">
        <span className="nav-left">
          <span className="nav-brand">
            <img src="/logo.png" alt="" width="56" height="56" />
            {profile.brand}
          </span>
        </span>
      </div>
      {/* Piramide 3d in alto a destra, alla stessa altezza del brand */}
      <div className="loader-pyramid" aria-hidden="true">
        <div className="pyramid-loader">
          <div className="wrapper">
            <span className="side side1" />
            <span className="side side2" />
            <span className="side side3" />
            <span className="side side4" />
            <span className="shadow" />
          </div>
        </div>
      </div>
      <CircularText
        text="CREATIVE • DEVELOPER • "
        spinDuration={40}
        onHover="speedUp"
        size={size}
        fontSize={Math.round(size * 0.16)}
        fontWeight={700}
        color="var(--accent)"
      >
      {started ? (
        <div className="loader-spin">
          <div className="loader-container" aria-hidden="true">
            <div className="sphere-core" />
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
          </div>
          <span className="loader-pct">{pct}%</span>
        </div>
      ) : (
        <button
          type="button"
          className="loader-btn"
          onClick={onStart}
          aria-label="Play"
        >
          P L A Y
          <div className="loader-clip">
            <div className="corner left-top" />
            <div className="corner right-bottom" />
            <div className="corner right-top" />
            <div className="corner left-bottom" />
          </div>
          <span className="arrow right-arrow" />
          <span className="arrow left-arrow" />
        </button>
      )}
      </CircularText>
    </div>
  )
}
