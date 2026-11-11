// Chi sei. Modifica solo questo file per cambiare testi di Hero, About, Marquee e "What I do".
// Tutto cio' che inizia con TODO e' un segnaposto da sostituire.
// I testi traducibili sono { it, en }; una stringa semplice vale per entrambe le lingue.

export const profile = {
  name: 'Manuel Nunziata', // TODO: nome e cognome (nell'Hero va su due righe: prima parola / resto)
  brand: 'manuel.dev', // TODO: scritta in alto a sinistra nella navbar
  roles: ['Developer', 'Designer'], // TODO: parole che si alternano nell'Hero (una sola = fissa)
  tagline: { it: 'Un Creative', en: 'A Creative' }, // piccola scritta sopra il ruolo nell'Hero
  heroIntro: { it: 'Ciao! Sono', en: "Hello! I'm" }, // piccola scritta sopra il nome nell'Hero

  // About
  headline: { it: 'Sviluppo siti e web app con cura per i dettagli.', en: 'I build websites and web apps with an eye for detail.' }, // TODO: frase d'apertura
  bio: [
    { // TODO: rivedi e aggiusta questo paragrafo con parole tue
      it: 'Sono un Full-Stack AI Developer: mi dedico allo sviluppo di software e di applicazioni web, dal frontend con React e TypeScript al backend con Java, Spring e PostgreSQL. Ho completato il percorso AI Full-Stack Developer di Epicode nel 2026, dove ho imparato anche a integrare le API degli LLM nei miei progetti. Mi piace trasformare un\'idea in un prodotto funzionante, curato nei dettagli e sicuro.',
      en: 'I am a Full-Stack AI Developer: I focus on software and web application development, from the frontend with React and TypeScript to the backend with Java, Spring and PostgreSQL. I completed the Epicode AI Full-Stack Developer course in 2026, where I also learned to integrate LLM APIs into my projects. I like turning an idea into a working product that is polished and secure.',
    },
    {
      it: 'Il mio percorso di studi: Graduation Certificate in AI Full-Stack Developer, conseguito il 28/10/2026 presso Epicode Institute of Technology. Ho studiato programmazione a oggetti, Java e Spring, database con PostgreSQL e JPA, sviluppo frontend con JavaScript, TypeScript, React e Redux, comunicazione in tempo reale con WebSocket, oltre a testing, sicurezza (SQLi, XSS e CSRF) e integrazione di LLM. Ora sto cercando lavoro come Full-Stack Developer.',
      en: 'My education: Graduation Certificate in AI Full-Stack Developer, awarded on 28/10/2026 by Epicode Institute of Technology. I studied object-oriented programming, Java and Spring, databases with PostgreSQL and JPA, frontend development with JavaScript, TypeScript, React and Redux, real-time communication with WebSocket, plus testing, security (SQLi, XSS and CSRF) and LLM integration. I am now looking for a job as a Full-Stack Developer.',
    },
  ],
  photo: '/me.jpg', // file in frontend/public/me.jpg. Se manca compare il riquadro con le iniziali
  photoSet: '/me-480.webp 480w, /me-840.webp 840w', // versioni WebP piu' leggere (stessa foto); se non ci sono, resta il file sopra
  photoSize: { w: 1000, h: 1250 }, // misure del file originale: il browser riserva lo spazio prima del caricamento
  photoAlt: { it: 'Ritratto di Manuel Nunziata', en: 'Portrait of Manuel Nunziata' }, // TODO: aggiorna con il tuo nome
  location: '', // TODO: opzionale, es. 'Roma, Italia'. Vuoto = non viene mostrato

  // Parole che scorrono nel marquee
  keywords: ['DEVELOPER', 'DESIGNER', 'CREATIVE'],

  // Sezione "What I do"
  services: [
    { title: 'DEVELOP', text: { it: 'Costruisco siti e web app veloci con React, Node e database.', en: 'I build fast websites and web apps with React, Node and databases.' } }, // TODO: verifica
    { title: 'DESIGN', text: { it: 'Disegno interfacce pulite, con attenzione a dettagli e animazioni.', en: 'I design clean interfaces, with attention to details and animations.' } }, // TODO: verifica
  ],
}
