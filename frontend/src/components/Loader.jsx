import { useEffect, useRef, useState } from 'react'
import CircularText from './CircularText.jsx'
import useMedia from '../hooks/useMedia.js'
import { realProgress } from '../loadTrack.js'
import { profile } from '../data/profile.js'
import './Loader.css'

const DURATION = 3400 // ms: durata minima del caricamento
const MAX_WAIT = 60000 // ms: rete lentissima o file mancante: oltre questo tempo la schermata se ne va comunque (a freddo su telefono la scena puo' impiegare piu' di 25 s)

// Easing con qualche rallentamento, cosi' sembra un caricamento vero.
const curve = (p) => {
  const s = p * p * (3 - 2 * p)
  return Math.min(1, s * 0.85 + p * 0.15)
}

// Schermata iniziale: tasto PLAY al centro. Al click parte un caricamento finto fino al 100%
// (intanto il sito vero si monta dietro e si stabilizza), poi la schermata sparisce.
// Diametro dell'anello di testo: quasi tutta l'altezza della pagina (o la larghezza, se piu' stretta)
const ringSize = () => Math.round(Math.min(window.innerHeight, window.innerWidth) * 0.92)

// Parole che scorrono (telefono): stesse parole e stesso puntino dell'anello. Il gruppo si ripete due volte: il nastro scorre di
// esattamente un gruppo (-50%), quindi il giro ricomincia senza salti.
const BAND_TEXT = 'CREATIVE • DEVELOPER • '.repeat(4)
function Band({ reverse = false }) {
  return (
    <div className={reverse ? 'loader-band loader-band--reverse' : 'loader-band'} aria-hidden="true">
      <div className="loader-band-track">
        <span>{BAND_TEXT}</span>
        <span>{BAND_TEXT}</span>
      </div>
    </div>
  )
}

export default function Loader({ started, sceneReady = true, onStart, onDone }) {
  const phone = useMedia('(max-width: 800px)') // telefono: due fasce che scorrono sopra e sotto il tasto, al posto dell'anello
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

  // Percentuale VERA: byte scaricati dei modelli 3D + modelli montati + primo frame (vedi loadTrack.js). Si muove subito (piccolo avvio a tempo)
  // e non supera mai il caricamento reale; il tempo minimo (DURATION) evita che con la cache calda salti a 100 in un attimo.
  useEffect(() => {
    if (!started) return
    let raf
    const t0 = performance.now()
    let last = t0
    let shown = 0
    let best = 0
    const tick = (now) => {
      const dt = Math.min(0.5, (now - last) / 1000) // tempo REALE trascorso: anche con pochi fps la percentuale avanza
      last = now
      const elapsed = now - t0
      const isReady = ready.current
      const real = isReady ? 1 : Math.min(0.99, realProgress())
      const creep = 0.06 * (1 - Math.exp(-elapsed / 1500)) // prima dei primi byte (latenza di rete) si muove comunque, subito (fino a ~6%)
      best = Math.max(best, real, creep) // mai all'indietro (il totale di un secondo file puo' arrivare dopo)
      shown += (best - shown) * (1 - Math.exp(-dt / (isReady ? 0.15 : 0.4))) // inseguimento morbido
      const cap = isReady ? curve(Math.min(1, elapsed / DURATION)) : 0.99
      const finished = (isReady && elapsed >= DURATION) || elapsed >= MAX_WAIT
      setPct(finished ? 100 : Math.max(0, Math.min(99, Math.floor(Math.min(shown, cap) * 100))))
      if (!finished) raf = requestAnimationFrame(tick)
      else {
        setLeaving(true)
        setTimeout(() => done.current(), 600)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started])

  const center = (
    <>
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
    </>
  )
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
      {phone ? (
        <div className="loader-phone">
          <Band />
          <div className="loader-phone-center">{center}</div>
          <Band reverse />
        </div>
      ) : (
        <CircularText
          text="CREATIVE • DEVELOPER • "
          spinDuration={40}
          onHover="speedUp"
          size={size}
          fontSize={Math.round(size * 0.16)}
          fontWeight={700}
          color="var(--accent)"
        >
          {center}
        </CircularText>
      )}
    </div>
  )
}
