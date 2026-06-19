import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { APP_PREFERENCES_STORAGE_KEY } from './contexts/preferences-context'

const storedPreferences = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY)

if (storedPreferences) {
  try {
    const parsed = JSON.parse(storedPreferences) as {
      theme?: 'light' | 'dark' | 'graphite' | 'rose' | 'emerald' | 'sunset'
      fontSize?: 'medium' | 'large'
      density?: 'default' | 'compact'
    }

    if (parsed.theme) {
      document.documentElement.dataset.theme = parsed.theme
      document.documentElement.style.colorScheme =
        parsed.theme === 'light' ? 'light' : 'dark'
    }

    if (parsed.fontSize) {
      document.documentElement.dataset.fontSize = parsed.fontSize
    }

    if (parsed.density) {
      document.documentElement.dataset.density = parsed.density
    }
  } catch {
    // Ignore invalid saved preferences.
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
