// Lingua del sito: italiano (predefinita) o inglese. La scelta resta salvata nel browser.
// - UI: i testi fissi dell'interfaccia stanno qui sotto, in `UI`.
// - Dati (frontend/src/data/*): un testo traducibile si scrive come { it: '...', en: '...' };
//   una stringa semplice resta uguale in entrambe le lingue (nomi, termini tecnici).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'lang'
const LANGS = ['it', 'en']

const UI = {
  it: {
    navLabel: 'Principale',
    nav: { about: 'Chi sono', experience: 'Esperienze', work: 'Progetti', contact: 'Contatti' },
    langLabel: 'Lingua',
    titles: {
      about: ['CHI', 'SONO'],
      experience: ['LE MIE', 'ESPERIENZE'],
      work: ['I MIEI', 'PROGETTI'],
      stack: ['IL MIO', 'TECHSTACK'],
      what: ['COSA', 'FACCIO'],
      contact: ['Lavoriamo', 'insieme.'],
    },
    photoPlaceholder: 'Spazio per la tua foto',
    toolsUsed: 'Tecnologie usate',
    social: 'Social',
    open: (title) => `Apri ${title}`,
    preview: (title) => `Anteprima di ${title}`,
    visit: 'Clicca per visitare il sito',
    seeCode: 'Clicca per vedere il codice',
    live: 'Live',
    repo: 'Repo',
    writeMe: 'Scrivimi',
    form: { name: 'Nome', email: 'Email', message: 'Messaggio', send: 'Invia messaggio', sending: 'Invio...' },
    status: {
      sent: 'Messaggio inviato. Ti rispondo appena posso.',
      mailto: "Si è aperto il tuo programma di posta: controlla e premi invia.",
      error: 'Invio non riuscito. Riprova o scrivimi direttamente via email.',
    },
    mailSubject: (name) => `Messaggio dal portfolio da ${name}`,
  },
  en: {
    navLabel: 'Main',
    nav: { about: 'About', experience: 'Experience', work: 'Work', contact: 'Contact' },
    langLabel: 'Language',
    titles: {
      about: ['ABOUT', 'ME'],
      experience: ['MY', 'EXPERIENCE'],
      work: ['MY', 'WORK'],
      stack: ['MY', 'TECHSTACK'],
      what: ['WHAT', 'I DO'],
      contact: ["Let's work", 'together.'],
    },
    photoPlaceholder: 'Space for your photo',
    toolsUsed: 'Technologies used',
    social: 'Social',
    open: (title) => `Open ${title}`,
    preview: (title) => `Preview of ${title}`,
    visit: 'Click to visit the site',
    seeCode: 'Click to see the code',
    live: 'Live',
    repo: 'Repo',
    writeMe: 'Write to me',
    form: { name: 'Name', email: 'Email', message: 'Message', send: 'Send message', sending: 'Sending...' },
    status: {
      sent: "Message sent. I'll get back to you as soon as I can.",
      mailto: 'Your mail app has opened: check the message and hit send.',
      error: 'Sending failed. Try again or write to me directly by email.',
    },
    mailSubject: (name) => `Portfolio message from ${name}`,
  },
}

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY)
    if (LANGS.includes(saved)) return saved
  } catch {
    /* localStorage non disponibile: si resta sull'italiano */
  }
  return 'it'
}

const LangContext = createContext({ lang: 'it', setLang: () => {}, t: UI.it, tr: (v) => v })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  const setLang = useCallback((next) => {
    if (!LANGS.includes(next)) return
    setLangState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* ignora */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => {
    // { it, en } -> testo nella lingua corrente; array -> si traduce ogni elemento; il resto passa invariato
    const tr = (v) => {
      if (Array.isArray(v)) return v.map(tr)
      if (v && typeof v === 'object' && ('it' in v || 'en' in v)) return v[lang] ?? v.it ?? v.en ?? ''
      return v
    }
    return { lang, setLang, t: UI[lang], tr }
  }, [lang, setLang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
