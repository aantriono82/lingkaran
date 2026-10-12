import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useIfp } from '../lib/ifpContext';
import { useOfflineReady } from '../lib/offline';
import { useTheme } from '../lib/themeContext';
import { WARNA_TEMA } from '../lib/tokens';

interface AppTopBarProps {
  onNavigateAway?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function AppTopBar({ onNavigateAway }: AppTopBarProps) {
  const { modeIfp, toggleModeIfp } = useIfp();
  const { isDark, toggleTheme } = useTheme();
  const { siap: offlineSiap } = useOfflineReady();

  return (
    <header className="app-topbar">
      <div className="topbar-container">
        <Link to="/" className="brand" onClick={onNavigateAway}>
          <div className="brand-logo" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="14" stroke="#ffffff" strokeWidth="3.5" />
              <path d="M20 20 L34 20" stroke={WARNA_TEMA.aksen} strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="3.5" fill={WARNA_TEMA.aksen} />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">Simulasi Lingkaran SMP</span>
            <span className="brand-subtitle">Matematika SMP Kelas 9 · Kurikulum Merdeka</span>
          </div>
        </Link>

        <div className="header-actions">
          {offlineSiap && (
            <span
              className="badge-offline"
              role="status"
              aria-label="Status koneksi: Siap digunakan secara offline tanpa jaringan"
            >
              <svg
                className="badge-offline-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <circle cx="12" cy="20" r="2" fill="currentColor" />
              </svg>
              <span className="badge-offline-text">Siap offline</span>
            </span>
          )}

          <button
            type="button"
            className={`theme-toggle ${isDark ? 'dark' : ''}`}
            aria-pressed={isDark}
            onClick={toggleTheme}
            title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            aria-label={isDark ? 'Mode gelap aktif. Klik untuk beralih ke mode terang' : 'Mode terang aktif. Klik untuk beralih ke mode gelap'}
          >
            {isDark ? (
              <svg
                className="theme-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                className="theme-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span className="theme-label">{isDark ? 'Mode terang' : 'Mode gelap'}</span>
          </button>

          <button
            type="button"
            className={`mode-ifp-toggle ${modeIfp ? 'aktif' : ''}`}
            aria-pressed={modeIfp}
            onClick={toggleModeIfp}
            title="Beralih ke tampilan layar sentuh IFP / layar kelas besar"
            aria-label={modeIfp ? 'Mode kelas aktif. Klik untuk kembali ke mode standar' : 'Mode kelas nonaktif. Klik untuk beralih ke mode IFP'}
          >
            <svg
              className="mode-ifp-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="mode-ifp-label">Mode kelas</span>
          </button>
        </div>
      </div>
    </header>
  );
}
