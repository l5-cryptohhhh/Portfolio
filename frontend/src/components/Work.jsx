import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Reveal from './Reveal.jsx'
import { projects } from '../data/projects.js'
import { useLang } from '../i18n.jsx'

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
  const { t, tr } = useLang()
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

  // Lo stato "hover" delle card lo calcoliamo noi: il :hover del browser si aggiorna solo se muovi il mouse,
  // ma qui la pagina scorre con la rotellina e la card sotto il puntatore cambia a mouse fermo.
  useEffect(() => {
    let x = -1
    let y = -1
    let current = null
    let raf = 0
    const update = () => {
      raf = 0
      const card = x < 0 ? null : document.elementFromPoint(x, y)?.closest('.card') ?? null
      if (card === current) return
      current?.classList.remove('is-hover')
      card?.classList.add('is-hover')
      current = card
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      schedule()
    }
    const onLeave = () => {
      x = -1
      schedule()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
      current?.classList.remove('is-hover')
    }
  }, [])

  return (
    <section className="work" id="work" ref={root}>
      <div className="work-track" ref={track}>
        <Reveal as="h2" className="work-title" lines={t.titles.work} accent={[1]} />
        {projects.map((p, i) => {
          const n = String(i + 1).padStart(2, '0')
          const href = p.live || p.repo // la card intera porta al sito live, o al repo se manca
          const Main = href ? 'a' : 'div'
          const linkProps = href
            ? { href, target: '_blank', rel: 'noopener noreferrer', 'aria-label': t.open(p.title) }
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
                    alt={t.preview(p.title)}
                    loading="lazy"
                    width="1260"
                    height="600"
                  />
                </div>
                <h3>{p.title}</h3>
                <p className="card-desc">{tr(p.description)}</p>
                <small>{p.tools.join(', ')}</small>
                {href && <span className="card-cta">{p.live ? t.visit : t.seeCode} &#8599;</span>}
              </Main>
              {(p.live || p.repo) && (
                <div className="card-links">
                  {p.live && (
                    <a className="cursor-target" href={p.live} target="_blank" rel="noopener noreferrer">{t.live}</a>
                  )}
                  {p.repo && (
                    <a className="cursor-target" href={p.repo} target="_blank" rel="noopener noreferrer">{t.repo}</a>
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
