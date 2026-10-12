import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { UpdateToast } from './components/UpdateToast';
import { IfpProvider } from './lib/ifpContext';
import { ThemeProvider } from './lib/themeContext';

const TopicPage = lazy(() => import('./pages/TopicPage').then((m) => ({ default: m.TopicPage })));

export function App() {
  return (
    <ThemeProvider>
      <IfpProvider>
        <HashRouter>
          <Suspense fallback={<div className="page-shell"><div className="loading-spinner" aria-label="Memuat modul simulasi..." /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/topik/:id" element={<TopicPage />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
          <UpdateToast />
        </HashRouter>
      </IfpProvider>
    </ThemeProvider>
  );
}
