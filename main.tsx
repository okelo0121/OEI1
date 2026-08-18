import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import './style.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element "#root" not found in index.html; cannot mount the app.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
