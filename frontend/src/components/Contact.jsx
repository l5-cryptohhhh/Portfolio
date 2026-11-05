import { useState } from 'react'
import Magnetic from './Magnetic.jsx'
import Reveal from './Reveal.jsx'
import { contacts } from '../data/contacts.js'
import { useLang } from '../i18n.jsx'

// Se VITE_FORM_ENDPOINT e' impostata (file .env) il form invia i dati a quell'indirizzo in POST (JSON).
// Altrimenti apre il client di posta con il messaggio gia' scritto (mailto).
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

export default function Contact() {
  const { t } = useLang()
  const [status, setStatus] = useState('idle') // idle | sending | sent | mailto | error

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    if (!ENDPOINT) {
      const subject = encodeURIComponent(t.mailSubject(data.name))
      const body = encodeURIComponent(`${data.message}\n\n${data.name} (${data.email})`)
      window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`
      setStatus('mailto')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const socials = contacts.socials.filter((s) => s.url)

  return (
    <section className="contact" id="contact">
      <div className="contact-intro">
        <Reveal as="h2" lines={t.titles.contact} accent={[1]} />
        <Magnetic strength={0.4}>
          <a className="contact-link cursor-target" data-cursor-label={t.writeMe} href={`mailto:${contacts.email}`}>
            {contacts.email}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </a>
        </Magnetic>
        {socials.length > 0 && (
          <ul className="socials">
            {socials.map((s) => (
              <li key={s.label}>
                <a className="cursor-target" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="contact-form" onSubmit={onSubmit}>
        <label>
          <span>{t.form.name}</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          <span>{t.form.email}</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>{t.form.message}</span>
          <textarea name="message" rows="5" required />
        </label>
        <button className="contact-link cursor-target" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? t.form.sending : t.form.send}
        </button>
        <p className="form-status" role="status" aria-live="polite" data-state={status}>
          {t.status[status] || ''}
        </p>
      </form>
    </section>
  )
}
