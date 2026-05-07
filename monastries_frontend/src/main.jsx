import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import { Analytics } from './components/Analytics'
import { ThemeProvider } from './context/ThemeContext'
import { AIProvider } from './context/AIContext'
import { ErrorBoundary } from './components/ErrorBoundary'

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Analytics />
    <ErrorBoundary>
      <ThemeProvider>
        <AIProvider>
          <App />
        </AIProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
