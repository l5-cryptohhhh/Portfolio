// Progetti mostrati nella sezione Work (scroll orizzontale).
// - live / repo: se entrambi sono vuoti la card non e' cliccabile.
//   Se c'e' solo uno dei due, la card intera porta a quello.
// - image: percorso in frontend/public/ (es. '/projects/uno.jpg'). Vuoto = immagine segnaposto casuale.

export const projects = [
  {
    title: 'Fymera One', // TODO
    description: 'Centralino e chatbot AI con dashboard',
    tools: ['Next.js', 'TypeScript', 'NestJS', 'PostgreSQL', 'Docker'],
    live: 'https://fymera.one/',
    repo: '', // TODO: link a GitHub (se e' pubblico)
    image: '/projects/fymera.png',
  },
  {
    title: 'ScoutAi',
    description: 'Dashboard con circa 6.100 giocatori con integrazioni AI',
    tools: ['React', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Three.js', 'Groq AI'],
    live: 'https://scoutai-web-l0yu.onrender.com',
    repo: '',
    image: '/projects/scoutai.png',
  },
  {
    title: 'CodeVar',
    description: 'Simulazione realistica in 3d del VAR, fuorigiochi, falli e rigori.',
    tools: ['JavaScript', 'Three.js', 'Node.js', 'Express', 'Vite'],
    live: 'https://l5-cryptohhhh.github.io/CodeVar/',
    repo: 'https://github.com/l5-cryptohhhh/CodeVar',
    image: '/projects/codevar.png',
  },
  {
    title: 'Progetto Quattro',
    description: 'TODO: una frase su cosa fa il progetto.',
    tools: ['PHP', 'JavaScript', 'CSS'],
    live: '',
    repo: '',
    image: '',
  },
  {
    title: 'Progetto Cinque',
    description: 'TODO: una frase su cosa fa il progetto.',
    tools: ['React', 'Three.js'],
    live: '',
    repo: '',
    image: '',
  },
  {
    title: 'Progetto Sei',
    description: 'TODO: una frase su cosa fa il progetto.',
    tools: ['TypeScript', 'Supabase'],
    live: '',
    repo: '',
    image: '',
  },
]
