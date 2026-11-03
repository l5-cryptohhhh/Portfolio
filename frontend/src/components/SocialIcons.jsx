import { GithubLogo, InstagramLogo, LinkedinLogo, XLogo } from '@phosphor-icons/react'
import { contacts } from '../data/contacts.js'

// L'etichetta in frontend/src/data/contacts.js decide l'icona. Compaiono solo i social con un URL compilato.
const ICONS = { github: GithubLogo, linkedin: LinkedinLogo, x: XLogo, instagram: InstagramLogo }

export default function SocialIcons({ className }) {
  const list = contacts.socials.filter((s) => s.url && ICONS[s.label.toLowerCase()])
  if (!list.length) return null
  return (
    <ul className={className} aria-label="Social">
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
