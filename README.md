# Portfolio

Avvio:

    npm install
    npm run dev

Build di produzione: `npm run build` (anteprima con `npm run preview`).

## Dove modificare i contenuti

Tutti i testi stanno in `src/data/`. I segnaposto sono marcati con `TODO`.

| File | Cosa contiene |
| --- | --- |
| `profile.js` | nome, ruolo, bio, foto, parole del marquee, servizi di "What I do" |
| `experience.js` | timeline delle esperienze |
| `projects.js` | progetti (titolo, descrizione, tecnologie, link live e repo, immagine) |
| `contacts.js` | email e social |
| `tech.js` | tecnologie delle palline in TechStack |

Per trovare tutto cio' che resta da compilare: cerca `TODO` in `src/data/` e in `index.html`.

## File da aggiungere in `public/`

- `avatar.glb`: personaggio dell'Hero (se manca compare un segnaposto)
- `desk.glb`: scena di "What I do" (se manca compare un segnaposto)
- la tua foto (es. `me.jpg`) e il percorso in `profile.photo`
- immagini dei progetti (es. `projects/uno.jpg`) e il percorso in `projects.js`
- `icons/<nome>.svg`: icone per le palline. Il nome e' il campo `icon` di `tech.js`.
  Se il file esiste viene usato, altrimenti si usa il logo ufficiale incluso nel progetto.

## Form di contatto

Senza configurazione il form apre il programma di posta (mailto).
Per inviarlo a un servizio, copia `.env.example` in `.env` e imposta `VITE_FORM_ENDPOINT`.
Il form invia un POST JSON con `name`, `email`, `message`.

## Note

- Su touch e con "riduci movimento" attivo: niente cursori custom, niente scroll fluido, la sezione Work va in colonna.
- Le sezioni 3D (Hero, What I do, TechStack) si caricano a parte per alleggerire il primo caricamento.
