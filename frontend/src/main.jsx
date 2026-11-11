import React, { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Loader from './components/Loader.jsx'
import './styles.css'
import { LangProvider } from './i18n.jsx'

// Il sito si monta solo dopo il click su PLAY: il caricamento finto gli da' il tempo di stabilizzarsi.
function Root() {
  const [started, setStarted] = useState(false)
  const [appOn, setAppOn] = useState(false) // l'app (pesante) si monta un attimo dopo il click: prima il loader si disegna e la percentuale parte
  const [ready, setReady] = useState(false)
  const [sceneReady, setSceneReady] = useState(false) // il personaggio 3D e' gia' disegnato
  const onSceneReady = useCallback(() => setSceneReady(true), [])
  // I font devono essere arrivati prima di togliere la schermata, altrimenti il layout si sposta dopo (massimo 8 s di attesa)
  const [fontsReady, setFontsReady] = useState(false)
  useEffect(() => {
    const fonts = document.fonts
    if (!fonts) return setFontsReady(true)
    const wanted = ['800 20px Unbounded', '700 20px Unbounded', '400 16px Outfit', '600 16px Outfit']
    Promise.race([
      Promise.all([...wanted.map((f) => fonts.load(f).catch(() => null)), fonts.ready]),
      new Promise((r) => setTimeout(r, 8000)),
    ]).then(() => setFontsReady(true))
  }, [])

  useEffect(() => {
    if (!started) return
    let id2
    const id = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setTimeout(() => setAppOn(true), 120))
    })
    return () => {
      cancelAnimationFrame(id)
      cancelAnimationFrame(id2)
    }
  }, [started])

  // Finche' la schermata e' visibile la pagina non scorre
  useEffect(() => {
    if (ready) return
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [ready])

  return (
    <LangProvider>
      {appOn && <App entered={ready} onReady={onSceneReady} />}
      {!ready && <Loader started={started} sceneReady={sceneReady && fontsReady} onStart={() => setStarted(true)} onDone={() => setReady(true)} />}
    </LangProvider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
