import type { ReactNode } from 'react';
import type { TabId } from '../types';

interface TabItem {
  id: TabId;
  label: string;
  ikon: ReactNode;
}

const tabs: TabItem[] = [
  {
    id: 'eksplorasi',
    label: 'Eksplorasi',
    ikon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
      </svg>
    )
  },
  {
    id: 'konsep',
    label: 'Konsep',
    ikon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  },
  {
    id: 'latihan',
    label: 'Latihan',
    ikon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    )
  },
  {
    id: 'kuis',
    label: 'Kuis',
    ikon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.5 13.5L18 21l-6-3-6 3 2.5-7.5" />
      </svg>
    )
  }
];

export function Tabs({ aktif, onChange }: { aktif: TabId; onChange: (tab: TabId) => void }) {
  return (
    <nav className="tabs tabs-pill-nav" aria-label="Bagian topik" role="tablist">
      {tabs.map((tab) => {
        const isAktif = aktif === tab.id;
        return (
          <button
            type="button"
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isAktif}
            aria-controls={`panel-${tab.id}`}
            key={tab.id}
            className={`tab ${isAktif ? 'aktif active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span className="tab-icon" aria-hidden="true">{tab.ikon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
