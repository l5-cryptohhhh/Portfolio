import { useState } from 'react'
import Magnetic from './Magnetic.jsx'
import Reveal from './Reveal.jsx'
import { contacts } from '../data/contacts.js'

// Se VITE_FORM_ENDPOINT e' impostata (file .env) il form invia i dati a quell'indirizzo in POST (JSON).
// Altrimenti apre il client di posta con il messaggio gia' scritto (mailto).
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

const MESSAGES = {
  sent: 'Messaggio inviato. Ti rispondo appena posso.',
  mailto: 'Si e\' aperto il tuo programma di posta: controlla e premi invia.',
  error: 'Invio non riuscito. Riprova o scrivimi direttamente via email.',
}

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | mailto | error

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    if (!ENDPOINT) {
      const subject = encodeURIComponent(`Messaggio dal portfolio da ${data.name}`)
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
        <Reveal as="h2" lines={["Let's work", 'together.']} accent={[1]} />
        <Magnetic strength={0.4}>
          <a className="contact-link cursor-target" data-cursor-label="Scrivimi" href={`mailto:${contacts.email}`}>
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
          <span>Nome</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Messaggio</span>
          <textarea name="message" rows="5" required />
        </label>
        <button className="contact-link cursor-target" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Invio...' : 'Invia messaggio'}
        </button>
        <p className="form-status" role="status" aria-live="polite" data-state={status}>
          {MESSAGES[status] || ''}
        </p>
      </form>
    </section>
  )
}
