// Contatti. Il form usa `email` come destinatario del mailto.
// Per inviare davvero il form a un servizio, imposta VITE_FORM_ENDPOINT in .env (vedi .env.example).

export const contacts = {
  email: 'nunziatamanuel5@gmail.com', // TODO: la tua email
  socials: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/manuel-nunziata/' }, // TODO: https://www.linkedin.com/in/...
    { label: 'GitHub', url: 'https://github.com/l5-cryptohhhh' }, // TODO: https://github.com/...
    { label: 'X', url: '' }, // TODO: opzionale, https://x.com/... (vuoto = non compare)
    { label: 'Instagram', url: '' }, // TODO: opzionale, https://instagram.com/... (vuoto = non compare)
  ],
}
