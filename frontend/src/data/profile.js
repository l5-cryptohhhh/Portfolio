// Chi sei. Modifica solo questo file per cambiare testi di Hero, About, Marquee e "What I do".
// Tutto cio' che inizia con TODO e' un segnaposto da sostituire.

export const profile = {
  name: 'Manuel Nunziata', // TODO: nome e cognome (nell'Hero va su due righe: prima parola / resto)
  brand: 'manuel.dev', // TODO: scritta in alto a sinistra nella navbar
  roles: ['Developer', 'Designer'], // TODO: parole che si alternano nell'Hero (una sola = fissa)
  tagline: 'A Creative', // piccola scritta sopra il ruolo nell'Hero
  heroIntro: "Hello! I'm", // piccola scritta sopra il nome nell'Hero

  // About
  headline: 'Sviluppo siti e web app con cura per i dettagli.', // TODO: frase d'apertura
  bio: [
    'TODO: scrivi qui 2 o 3 frasi su chi sei, cosa fai e cosa ti piace costruire.',
    'TODO: un secondo paragrafo (percorso, interessi, cosa cerchi adesso).',
  ],
  photo: '', // TODO: percorso della foto, es. '/me.jpg' (file in frontend/public/). Vuoto = riquadro segnaposto
  photoAlt: 'Ritratto di Tuo Nome', // TODO: aggiorna con il tuo nome
  location: '', // TODO: opzionale, es. 'Roma, Italia'. Vuoto = non viene mostrato

  // Parole che scorrono nel marquee
  keywords: ['DEVELOPER', 'DESIGNER', 'CREATIVE'],

  // Sezione "What I do"
  services: [
    { title: 'DEVELOP', text: 'Costruisco siti e web app veloci con React, Node e database.' }, // TODO: verifica
    { title: 'DESIGN', text: 'Disegno interfacce pulite, con attenzione a dettagli e animazioni.' }, // TODO: verifica
  ],
}
