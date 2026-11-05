import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { LangProvider } from './i18n.jsx'

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <App />
  </LangProvider>
)
