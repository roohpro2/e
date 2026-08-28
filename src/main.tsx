import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminConfigProvider } from './context/AdminConfigContext';
import { CloudflareProvider } from './context/CloudflareContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Safely catch cross-origin external script errors and unhandled rejections
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message === 'Script error.' || !event.filename) {
      // Cross-origin script error from external resources or ad networks
      event.preventDefault();
      return;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Prevent unhandled promise rejections from crashing the view
    if (event.reason?.name === 'SecurityError' || event.reason?.message?.includes?.('permission')) {
      event.preventDefault();
      return;
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AdminConfigProvider>
          <CloudflareProvider>
            <App />
          </CloudflareProvider>
        </AdminConfigProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

