import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import './i18n'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { setupDomDebugging } from './lib/domDebug'
import { initGoogleTagManager } from './lib/gtm'

setupDomDebugging()
initGoogleTagManager(import.meta.env.VITE_GTM_CONTAINER_ID)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
