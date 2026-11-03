import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// index.html e package.json stanno nella radice (cosi' `npm run dev` parte da li).
// Il codice del sito sta in frontend/: i file statici (avatar.glb, immagini, icone) in frontend/public.
export default defineConfig({
  plugins: [react()],
  publicDir: 'frontend/public',
})
