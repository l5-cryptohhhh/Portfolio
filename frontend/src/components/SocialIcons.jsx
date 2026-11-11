import { useEffect, useRef } from 'react'
import { GithubLogo, InstagramLogo, LinkedinLogo, XLogo } from '@phosphor-icons/react'
import { contacts } from '../data/contacts.js'
import { useLang } from '../i18n.jsx'

// L'etichetta in frontend/src/data/contacts.js decide l'icona. Compaiono solo i social con un URL compilato.
const ICONS = { github: GithubLogo, linkedin: LinkedinLogo, x: XLogo, instagram: InstagramLogo }

// Le icone stanno dentro la hero e scorrono con lei, mentre il logo in alto e' fisso: salendo gli passerebbero sopra.
// Con `fade` sfumano e smettono di essere cliccabili un attimo prima di arrivare sotto il logo (LOGO_BOTTOM).
const LOGO_BOTTOM = 78 // px dal bordo alto dello schermo
const FADE_SPAN = 70 // px di scroll in cui l'opacita' scende da 1 a 0

export default function SocialIcons({ className, fade = false }) {
  const { t } = useLang()
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!fade || !el) return
    let natural = 0 // distanza dal bordo alto della pagina quando la pagina e' in cima
    const measure = () => {
      natural = el.getBoundingClientRect().top + window.scrollY
    }
    const update = () => {
      // fine = scroll a cui il bordo alto delle icone arriva sotto il logo (almeno FADE_SPAN, per le icone gia' vicine al logo)
      const end = Math.max(natural - LOGO_BOTTOM, FADE_SPAN)
      const o = Math.min(1, Math.max(0, (end - window.scrollY) / FADE_SPAN))
      el.style.opacity = o
      el.style.pointerEvents = o < 0.05 ? 'none' : ''
    }
    measure()
    update()
    const onResize = () => {
      el.style.opacity = ''
      measure()
      update()
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', onResize)
    }
  }, [fade])
  const list = contacts.socials.filter((s) => s.url && ICONS[s.label.toLowerCase()])
  if (!list.length) return null
  return (
    <ul ref={ref} className={className} aria-label={t.social}>
      {list.map((s) => {
        const Icon = ICONS[s.label.toLowerCase()]
        return (
          <li key={s.label}>
            <a className="cursor-target" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
              <Icon size={28} weight="fill" aria-hidden="true" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
