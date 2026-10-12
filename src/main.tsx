import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './styles.css';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: { updateSW } }));
  },
  onOfflineReady() {
    window.dispatchEvent(new Event('pwa-offline-ready'));
  }
});

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
