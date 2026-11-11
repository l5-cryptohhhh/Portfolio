import { Suspense, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Dopo che il contenuto lazy e' arrivato, ricalcola le posizioni di ScrollTrigger (la sezione Work le usa)
function Refresh() {
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [])
  return null
}

// Monta (e quindi scarica) una sezione pesante solo quando e' vicina allo schermo.
// Il segnaposto occupa la stessa altezza per evitare salti di layout.
// Con `idle` monta anche da solo, appena la pagina e' caricata e il browser e' libero: la sezione e' gia' pronta
// quando ci arrivi (vale la pena per quelle lontane e pesanti, come le palline). Resta valido anche l'avvicinamento.
export default function LazyOnView({ children, minHeight = '100dvh', rootMargin = '700px 0px', idle = false }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!idle || show) return
    let id
    const mount = () => {
      id = 'requestIdleCallback' in window ? requestIdleCallback(() => setShow(true), { timeout: 3000 }) : setTimeout(() => setShow(true), 1500)
    }
    if (document.readyState === 'complete') mount()
    else window.addEventListener('load', mount, { once: true })
    return () => {
      window.removeEventListener('load', mount)
      if ('requestIdleCallback' in window) cancelIdleCallback(id)
      else clearTimeout(id)
    }
  }, [idle, show])

  useEffect(() => {
    if (show || !ref.current) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [show, rootMargin])

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show && (
        <Suspense fallback={<div style={{ minHeight }} />}>
          {children}
          <Refresh />
        </Suspense>
      )}
    </div>
  )
}
