import React, { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Loader from './components/Loader.jsx'
import './styles.css'
import { LangProvider } from './i18n.jsx'

// Il sito si monta solo dopo il click su PLAY: il caricamento finto gli da' il tempo di stabilizzarsi.
function Root() {
  const [started, setStarted] = useState(false)
  const [ready, setReady] = useState(false)
  const [sceneReady, setSceneReady] = useState(false) // il personaggio 3D e' gia' disegnato
  const onSceneReady = useCallback(() => setSceneReady(true), [])

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
      {started && <App entered={ready} onReady={onSceneReady} />}
      {!ready && <Loader started={started} sceneReady={sceneReady} onStart={() => setStarted(true)} onDone={() => setReady(true)} />}
    </LangProvider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
