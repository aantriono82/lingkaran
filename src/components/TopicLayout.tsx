import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { TabId, TopicMeta } from '../types';
import { Tabs } from './Tabs';
import { AppTopBar } from './AppTopBar';
import { formatEyebrowTopik, tentukanNavigasiTopik } from '../lib/topicNav';

interface TopicLayoutProps {
  meta: TopicMeta;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
  sebelumnya?: TopicMeta;
  berikutnya?: TopicMeta;
  onNavigateAway?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function TopicLayout({
  meta,
  tab,
  onTabChange,
  children,
  onNavigateAway
}: TopicLayoutProps) {
  const eyebrowText = formatEyebrowTopik(meta);
  const nav = tentukanNavigasiTopik(meta.id);

  return (
    <>
      <AppTopBar onNavigateAway={onNavigateAway} />
      <main className="topic-page page-shell">
        {/* Sub-header terpadu navigasi */}
        <div className="topic-sub-header">
          <div className="topic-nav-bar">
            <Link className="back-btn-pill" to="/" onClick={onNavigateAway} aria-label="Kembali ke Beranda">
              <span aria-hidden="true" className="nav-arrow">←</span>
              <span>Beranda</span>
            </Link>

            <nav className="topic-stepper-nav" aria-label="Navigasi topik sebelumnya dan berikutnya">
              {nav.sebelumnya.ada && nav.sebelumnya.topik ? (
                <Link
                  to={`/topik/${nav.sebelumnya.topik.id}`}
                  className="step-btn-pill"
                  onClick={onNavigateAway}
                  aria-label={`Buka Topik sebelumnya: Topik ${nav.sebelumnya.topik.nomor} ${nav.sebelumnya.topik.nama}`}
                >
                  {nav.sebelumnya.label}
                </Link>
              ) : (
                <span className="step-btn-pill disabled" aria-disabled="true" title="Ini adalah topik pertama">
                  {nav.sebelumnya.label}
                </span>
              )}

              {nav.berikutnya.ada && nav.berikutnya.topik ? (
                <Link
                  to={`/topik/${nav.berikutnya.topik.id}`}
                  className="step-btn-pill"
                  onClick={onNavigateAway}
                  aria-label={`Buka Topik berikutnya: Topik ${nav.berikutnya.topik.nomor} ${nav.berikutnya.topik.nama}`}
                >
                  {nav.berikutnya.label}
                </Link>
              ) : (
                <span className="step-btn-pill disabled" aria-disabled="true" title="Ini adalah topik terakhir">
                  {nav.berikutnya.label}
                </span>
              )}
            </nav>
          </div>

          <header className="topic-header-unified">
            <span className="topic-eyebrow-unified">{eyebrowText}</span>
            <h1 className="topic-title-unified">{meta.nama}</h1>
            <p className="topic-desc-unified">{meta.ringkasan}</p>
          </header>
        </div>

        {/* Tab pill navigasi */}
        <Tabs aktif={tab} onChange={onTabChange} />

        {/* Konten tab */}
        <div className="topic-tab-content">
          {children}
        </div>
      </main>
    </>
  );
}
