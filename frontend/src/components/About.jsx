import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import Reveal from './Reveal.jsx'
import ReflectiveCard from './ReflectiveCard.jsx'
import { profile } from '../data/profile.js'
import { useLang } from '../i18n.jsx'

// Iniziali per il riquadro segnaposto quando non c'e' ancora una foto
const initials = profile.name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0].toUpperCase())
  .join('')

// Misure della scheda (il segnaposto che tiene il posto prima che compaia ha la stessa altezza)
const CARD_WIDTH = 'min(100%, 420px)'
const CARD_HEIGHT = 'clamp(430px, 125vw, 540px)'
const PHOTO_SIZES = '(max-width: 800px) 90vw, 420px' // larghezza reale della foto nella scheda: sceglie la versione giusta

export default function About() {
  const { lang, t, tr } = useLang()
  const [photoFailed, setPhotoFailed] = useState(false) // se il file non c'e', resta il riquadro con le iniziali
  const reduce = useReducedMotion()
  const cardRef = useRef(null)
  // La scheda (WebGL) nasce solo quando arrivi alla sezione: cosi' la sua entrata si vede e non pesa sul caricamento
  const cardInView = useInView(cardRef, { once: true, margin: '0px 0px -10% 0px' })
  // La foto si scarica e si decodifica prima che la scheda compaia: la scheda nasce solo a foto pronta (o dopo 3 s, per non bloccarla mai)
  const [photoReady, setPhotoReady] = useState(!profile.photo)
  useEffect(() => {
    if (!profile.photo) return
    let done = false
    const finish = () => {
      if (!done) {
        done = true
        setPhotoReady(true)
      }
    }
    const img = new Image()
    img.decoding = 'async'
    if (profile.photoSet) {
      img.sizes = PHOTO_SIZES
      img.srcset = profile.photoSet
    }
    img.src = profile.photo
    img.decode().then(finish, finish)
    const id = setTimeout(finish, 3000)
    return () => clearTimeout(id)
  }, [])
  const rise = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-12%' },
    transition: { type: 'spring', bounce: 0, duration: 0.9, delay },
  })

  return (
    <section className="about" id="about">
      <div className="about-card" ref={cardRef} style={{ height: CARD_HEIGHT }}>
        {cardInView && photoReady && (
          <ReflectiveCard width={CARD_WIDTH} height={CARD_HEIGHT} theme="dark" radius={24}>
            <div className="about-card-inner">
              <figure className="about-card-photo">
                {profile.photo && !photoFailed ? (
                  <img
                    src={profile.photo}
                    srcSet={profile.photoSet}
                    sizes={profile.photoSet ? PHOTO_SIZES : undefined}
                    width={profile.photoSize?.w}
                    height={profile.photoSize?.h}
                    alt={tr(profile.photoAlt)}
                    decoding="async"
                    onError={() => setPhotoFailed(true)}
                    draggable="false"
                  />
                ) : (
                  <div className="about-photo-empty" role="img" aria-label={t.photoPlaceholder}>
                    <span>{initials}</span>
                  </div>
                )}
              </figure>
              <div className="about-card-id">
                <h3>{profile.name}</h3>
                <p>{profile.roles.join(' · ')}</p>
              </div>
            </div>
          </ReflectiveCard>
        )}
      </div>
      <div className="about-body">
        <Reveal as="h2" className={lang === 'it' ? 'about-title inline' : 'about-title'} lines={t.titles.about} accent={[1]} />
        <motion.p className="about-lead" {...rise(0.1)}>{tr(profile.headline)}</motion.p>
        {profile.bio.map((text, i) => (
          <motion.p className="about-text" key={i} {...rise(0.18 + i * 0.08)}>{tr(text)}</motion.p>
        ))}
        {profile.location && <motion.p className="about-meta" {...rise(0.3)}>{tr(profile.location)}</motion.p>}
      </div>
    </section>
  )
}
