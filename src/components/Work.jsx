import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Reveal from './Reveal.jsx'
import { projects } from '../data/projects.js'

gsap.registerPlugin(ScrollTrigger)

// Inclinazione 3D dell'immagine verso il mouse + riflesso che lo segue.
// Usa solo variabili CSS (nessuno stato React): costa quasi zero.
function tilt(e) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  el.style.setProperty('--ry', `${(px - 0.5) * 12}deg`)
  el.style.setProperty('--rx', `${(0.5 - py) * 10}deg`)
  el.style.setProperty('--mx', `${px * 100}%`)
  el.style.setProperty('--my', `${py * 100}%`)
}
function untilt(e) {
  e.currentTarget.style.setProperty('--ry', '0deg')
  e.currentTarget.style.setProperty('--rx', '0deg')
}

// Horizontal scroll section: la sezione viene "pinnata" e il contenuto
// scorre in orizzontale mentre scrolli in verticale (ScrollTrigger pin + scrub).
// Su schermi piccoli o con "riduci movimento" niente pin: le card vanno in colonna (vedi styles.css).
export default function Work() {
  const root = useRef()
  const track = useRef()

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 801px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => track.current.scrollWidth - window.innerWidth
      gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="work" id="work" ref={root}>
      <div className="work-track" ref={track}>
        <Reveal as="h2" className="work-title" lines={['My', 'Work']} accent={[1]} />
        {projects.map((p, i) => {
          const n = String(i + 1).padStart(2, '0')
          const href = p.live || p.repo // la card intera porta al sito live, o al repo se manca
          const Main = href ? 'a' : 'div'
          const linkProps = href
            ? { href, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `Apri ${p.title}` }
            : {}
          return (
            <article
              className={href ? 'card cursor-target' : 'card'}
              key={`${p.title}-${n}`}
              data-cursor-label={href ? p.title : undefined}
            >
              <span className="card-n">{n}</span>
              <Main className="card-main" {...linkProps}>
                <div className="card-img" onPointerMove={tilt} onPointerLeave={untilt}>
                  {/* Senza immagine propria usa un segnaposto casuale (picsum) */}
                  <img
                    src={p.image || `https://picsum.photos/seed/portfolio-work-${n}/1260/600`}
                    alt={`Anteprima di ${p.title}`}
                    loading="lazy"
                    width="1260"
                    height="600"
                  />
                </div>
                <h3>{p.title}</h3>
                <p className="card-desc">{p.description}</p>
                <small>{p.tools.join(', ')}</small>
                {href && <span className="card-cta">{p.live ? 'Clicca per visitare il sito' : 'Clicca per vedere il codice'} &#8599;</span>}
              </Main>
              {(p.live || p.repo) && (
                <div className="card-links">
                  {p.live && (
                    <a className="cursor-target" href={p.live} target="_blank" rel="noopener noreferrer">Live</a>
                  )}
                  {p.repo && (
                    <a className="cursor-target" href={p.repo} target="_blank" rel="noopener noreferrer">Repo</a>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
