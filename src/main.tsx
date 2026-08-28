import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminConfigProvider } from './context/AdminConfigContext';
import { CloudflareProvider } from './context/CloudflareContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Client-Side Auto Canonical Redirection to roohpro.com/ai
if (typeof window !== 'undefined') {
  const currentHost = window.location.hostname.toLowerCase();
  if (currentHost.includes('pages.dev') || currentHost.includes('workers.dev')) {
    const currentHash = window.location.hash || '';
    const targetUrl = `https://roohpro.com/ai${currentHash ? currentHash : ''}`;
    // Instant smooth redirection preserving page route and item ID
    window.location.replace(targetUrl);
  }

  // Safely catch cross-origin external script errors and unhandled rejections
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
      <AdminConfigProvider>
        <CloudflareProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CloudflareProvider>
      </AdminConfigProvider>
    </ErrorBoundary>
  </StrictMode>
);
