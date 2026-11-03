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
export default function LazyOnView({ children, minHeight = '100dvh', rootMargin = '700px 0px' }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

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
