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
    {
      it: 'TODO: scrivi qui 2 o 3 frasi su chi sei, cosa fai e cosa ti piace costruire.',
      en: 'TODO: write 2 or 3 sentences here about who you are, what you do and what you like to build.',
    },
    {
      it: 'TODO: un secondo paragrafo (percorso, interessi, cosa cerchi adesso).',
      en: 'TODO: a second paragraph (background, interests, what you are looking for now).',
    },
  ],
  photo: '/me.jpg', // file in frontend/public/me.jpg. Se manca compare il riquadro con le iniziali
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
