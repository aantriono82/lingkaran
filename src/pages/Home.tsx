import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { DAFTAR_RUMPUN, type TopicMeta } from '../types';
import { topicRegistry, cariTopik } from '../topics/metadata';
import { bacaSemuaSkor, bacaTopikTerakhir, clearAllProgress } from '../lib/storage';
import { hitungProgresBelajar, tentukanTombolAksiHero } from '../lib/progress';
import { petaMiniatur } from '../components/miniatur';
import { AppTopBar } from '../components/AppTopBar';

interface TopicCardProps {
  topik: TopicMeta;
  skor: number | null;
  onPrefetch?: () => void;
}

const TopicCard = memo(function TopicCard({ topik, skor, onPrefetch }: TopicCardProps) {
  const KomponenMiniatur = petaMiniatur[topik.id];
  const statusTeks = skor !== null ? `Skor terbaik ${skor}/5` : 'Belum dicoba';

  const cardContent = (
    <>
      <div className="card-canvas-wrap">
        <span className="card-topic-number">{String(topik.nomor).padStart(2, '0')}</span>
        {skor !== null ? (
          <span className="card-status-badge badge-mastered">
            <span aria-hidden="true">★</span> Skor {skor}/5
          </span>
        ) : (
          <span className="card-status-badge badge-new">Belum dicoba</span>
        )}
        {KomponenMiniatur ? <KomponenMiniatur /> : null}
      </div>

      <div className="card-body">
        <h3 className="card-title">{topik.nama}</h3>
        <p className="card-desc">{topik.ringkasan}</p>
        <div className="card-footer">
          <span className="meta-modes">4 Tab · Interaktif</span>
          <span className="card-cta-link">Buka Simulasi →</span>
        </div>
      </div>
    </>
  );

  if (!topik.tersedia) {
    return (
      <div
        className="topic-card disabled"
        aria-disabled="true"
        aria-label={`Topik ${String(topik.nomor).padStart(2, '0')}: ${topik.nama}. Segera hadir.`}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      to={`/topik/${topik.id}`}
      className="topic-card"
      onPointerEnter={onPrefetch}
      onFocus={onPrefetch}
      aria-label={`Topik ${String(topik.nomor).padStart(2, '0')}: ${topik.nama}. Status: ${statusTeks}. Buka simulasi.`}
    >
      {cardContent}
    </Link>
  );
});

interface ProgressResetDialogProps {
  terbuka: boolean;
  pemicuRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onConfirm: () => void;
}

function ProgressResetDialog({ terbuka, pemicuRef, onClose, onConfirm }: ProgressResetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const batalRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!terbuka || !dialog) return undefined;
    dialog.showModal();
    batalRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [terbuka]);

  function tutupDanKembalikanFokus(): void {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
    window.requestAnimationFrame(() => pemicuRef.current?.focus());
  }

  function tanganiKeyboard(event: KeyboardEvent<HTMLDialogElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      tutupDanKembalikanFokus();
      return;
    }
    if (event.key !== 'Tab') return;
    const elemenFokus = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ?? []
    );
    if (elemenFokus.length === 0) return;
    const pertama = elemenFokus[0];
    const terakhir = elemenFokus[elemenFokus.length - 1];
    if (event.shiftKey && document.activeElement === pertama) {
      event.preventDefault();
      terakhir.focus();
    } else if (!event.shiftKey && document.activeElement === terakhir) {
      event.preventDefault();
      pertama.focus();
    }
  }

  if (!terbuka) return null;
  return (
    <dialog
      ref={dialogRef}
      className="progress-reset-dialog"
      aria-labelledby="judul-hapus-skor"
      aria-describedby="keterangan-hapus-skor"
      onCancel={(event) => {
        event.preventDefault();
        tutupDanKembalikanFokus();
      }}
      onKeyDown={tanganiKeyboard}
    >
      <h2 id="judul-hapus-skor">Hapus semua skor?</h2>
      <p id="keterangan-hapus-skor">
        Skor terbaik semua topik, riwayat kuis, dan penanda topik terakhir di perangkat ini akan dihapus. Pengaturan Mode Kelas tetap dipertahankan. Tindakan ini tidak bisa dibatalkan.
      </p>
      <div className="dialog-actions">
        <button ref={batalRef} type="button" className="button secondary" onClick={tutupDanKembalikanFokus}>
          Batal
        </button>
        <button
          type="button"
          className="button danger"
          onClick={() => {
            onConfirm();
            tutupDanKembalikanFokus();
          }}
        >
          Hapus skor
        </button>
      </div>
    </dialog>
  );
}

export function Home() {
  const pemicuResetRef = useRef<HTMLButtonElement>(null);
  const [dialogResetTerbuka, setDialogResetTerbuka] = useState(false);
  const [versiSkor, setVersiSkor] = useState(0);
  const [pesanReset, setPesanReset] = useState('');

  const jadwalkanPrefetch = useCallback(() => {
    import('./TopicPage');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(() => {
        import('./TopicPage');
      });
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    }
  }, []);

  // Hitung progres belajar secara reaktif dan efisien dari snapshot tunggal
  const semuaSkor = useMemo(() => bacaSemuaSkor(), [versiSkor]);
  const progres = useMemo(() => hitungProgresBelajar((id) => semuaSkor[id] ?? null), [semuaSkor]);
  const topikTerakhirId = useMemo(() => bacaTopikTerakhir(), [versiSkor]);
  const topikTerakhirMeta = useMemo(() => (topikTerakhirId ? cariTopik(topikTerakhirId) : undefined), [topikTerakhirId]);
  const tombolAksi = useMemo(
    () =>
      tentukanTombolAksiHero({
        topikTerakhirId,
        cariMeta: (id) => cariTopik(id)
      }),
    [topikTerakhirId]
  );

  function hapusProgres(): void {
    if (clearAllProgress()) {
      setVersiSkor((versi) => versi + 1);
      setPesanReset('Skor dan riwayat belajar di perangkat ini sudah dihapus.');
    } else {
      setPesanReset('Penyimpanan tidak dapat diakses saat ini. Aplikasi tetap dapat digunakan.');
    }
  }

  function gulirKeDaftarTopik(event: React.MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    const elemen = document.getElementById('daftar-topik');
    if (!elemen) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    elemen.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    elemen.focus();
  }

  return (
    <>
      <AppTopBar />

      <main className="home-container" key={versiSkor}>
        {/* Hero Banner Modern Interactive Classroom */}
        <section className="hero-banner" aria-labelledby="judul-hero">
          <div className="hero-content">
            <span className="eyebrow hero-eyebrow">Simulasi Lingkaran SMP</span>
            <h1 id="judul-hero" className="hero-title">Eksplorasi Geometri Interaktif</h1>
            <p className="hero-desc">
              Tarik titik, putar sudut, dan amati rumus KaTeX membuktikan dirinya secara visual secara langsung. Siap untuk layar sentuh IFP maupun HP mandiri.
            </p>
            <div className="hero-actions">
              <Link to={`/topik/${tombolAksi.targetTopikId}`} className="btn-cta">
                <span>{tombolAksi.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#daftar-topik" className="btn-secondary-hero" onClick={gulirKeDaftarTopik}>
                Lihat 10 Topik
              </a>
            </div>
          </div>

          {/* Widget Progres Belajar */}
          <div className="hero-widget" aria-label="Ringkasan kemajuan belajar">
            <div className="widget-header">
              <span className="widget-title">Kemajuan Belajar</span>
              <span className="widget-subtitle">Kurikulum Merdeka</span>
            </div>

            <div className="progress-stats-row">
              <span className="progress-number">
                {progres.jumlahSelesai} / {progres.totalTopik}
              </span>
              <span className="progress-sub">Topik Selesai</span>
            </div>

            <div
              className="progress-bar-bg"
              role="progressbar"
              aria-valuenow={progres.jumlahSelesai}
              aria-valuemin={0}
              aria-valuemax={progres.totalTopik}
              aria-label={`Kemajuan belajar: ${progres.jumlahSelesai} dari ${progres.totalTopik} topik selesai (${progres.persentase}%)`}
            >
              <div className="progress-bar-fill" style={{ width: `${progres.persentase}%` }} />
            </div>

            <div className="progress-meta-row">
              {progres.rataRataSkor !== null ? (
                <div className="progress-score-avg">
                  <span className="star-icon" aria-hidden="true">★</span>
                  <span>Rata-rata kuis: <strong>{progres.rataRataSkor} / 5</strong></span>
                </div>
              ) : (
                <span className="progress-empty-hint">Selesaikan kuis untuk mencatat skor terbaik</span>
              )}
            </div>

            {topikTerakhirMeta && (
              <div
                className="last-topic-badge-row"
                aria-label={`Terakhir dibuka: Topik ${topikTerakhirMeta.nomor} ${topikTerakhirMeta.nama}`}
              >
                <span className="last-topic-badge-label">Terakhir Dibuka:</span>
                <span className="last-topic-badge-val">
                  Topik {String(topikTerakhirMeta.nomor).padStart(2, '0')} · {topikTerakhirMeta.nama}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Daftar Topik Dikelompokkan per Rumpun */}
        <div id="daftar-topik" className="daftar-topik-anchor" tabIndex={-1} aria-label="Daftar topik pembelajaran">
          {/* Rumpun I: Bagian-Bagian dan Ukuran Lingkaran (Topik 1, 2, 3) */}
          <section className="module-group" aria-labelledby="rumpun-1-judul">
            <div className="module-header">
              <div className="module-title-wrap">
                <span className="module-badge" aria-hidden="true">{DAFTAR_RUMPUN[0].nomorRomawi}</span>
                <div>
                  <h2 id="rumpun-1-judul" className="module-title">{DAFTAR_RUMPUN[0].judul}</h2>
                  <p className="module-desc">{DAFTAR_RUMPUN[0].deskripsi}</p>
                </div>
              </div>
              <span className="module-count">{DAFTAR_RUMPUN[0].topikIds.length} Topik</span>
            </div>

            <div className="cards-grid">
              {DAFTAR_RUMPUN[0].topikIds.map((id) => renderCard(id))}
            </div>
          </section>

          {/* Rumpun II: Sudut-Sudut pada Lingkaran (Topik 4, 5, 6) */}
          <section className="module-group" aria-labelledby="rumpun-2-judul">
            <div className="module-header">
              <div className="module-title-wrap">
                <span className="module-badge" aria-hidden="true">{DAFTAR_RUMPUN[1].nomorRomawi}</span>
                <div>
                  <h2 id="rumpun-2-judul" className="module-title">{DAFTAR_RUMPUN[1].judul}</h2>
                  <p className="module-desc">{DAFTAR_RUMPUN[1].deskripsi}</p>
                </div>
              </div>
              <span className="module-count">{DAFTAR_RUMPUN[1].topikIds.length} Topik</span>
            </div>

            <div className="cards-grid">
              {DAFTAR_RUMPUN[1].topikIds.map((id) => renderCard(id))}
            </div>
          </section>

          {/* Rumpun III & IV: Berdampingan di Layar Lebar tanpa Kartu Menggantung */}
          <div className="rumpun-duo-grid">
            {/* Rumpun III: Segitiga dan Lingkaran (Topik 7, 8) */}
            <section className="module-group" aria-labelledby="rumpun-3-judul">
              <div className="module-header">
                <div className="module-title-wrap">
                  <span className="module-badge" aria-hidden="true">{DAFTAR_RUMPUN[2].nomorRomawi}</span>
                  <div>
                    <h2 id="rumpun-3-judul" className="module-title">{DAFTAR_RUMPUN[2].judul}</h2>
                    <p className="module-desc">{DAFTAR_RUMPUN[2].deskripsi}</p>
                  </div>
                </div>
                <span className="module-count">{DAFTAR_RUMPUN[2].topikIds.length} Topik</span>
              </div>

              <div className="cards-grid duo-cards-grid">
                {DAFTAR_RUMPUN[2].topikIds.map((id) => renderCard(id))}
              </div>
            </section>

            {/* Rumpun IV: Garis Singgung dan Kedudukan (Topik 9, 10) */}
            <section className="module-group" aria-labelledby="rumpun-4-judul">
              <div className="module-header">
                <div className="module-title-wrap">
                  <span className="module-badge" aria-hidden="true">{DAFTAR_RUMPUN[3].nomorRomawi}</span>
                  <div>
                    <h2 id="rumpun-4-judul" className="module-title">{DAFTAR_RUMPUN[3].judul}</h2>
                    <p className="module-desc">{DAFTAR_RUMPUN[3].deskripsi}</p>
                  </div>
                </div>
                <span className="module-count">{DAFTAR_RUMPUN[3].topikIds.length} Topik</span>
              </div>

              <div className="cards-grid duo-cards-grid">
                {DAFTAR_RUMPUN[3].topikIds.map((id) => renderCard(id))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Aplikasi yang Aman dan Nyaman di Layar Sentuh / HP */}
        <footer className="home-footer-new">
          <div className="footer-content">
            <p className="footer-credits">
              Made With{' '}
              <svg
                className="footer-heart-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-label="love"
                role="img"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="currentColor"
                />
              </svg>{' '}
              By Aan Triono
            </p>
            <div className="footer-actions">
              <button
                ref={pemicuResetRef}
                type="button"
                className="button-reset-progress"
                onClick={() => setDialogResetTerbuka(true)}
                title="Hapus riwayat skor dan kemajuan belajar di perangkat ini"
              >
                Hapus skor di perangkat ini
              </button>
            </div>
          </div>
        </footer>

        {/* Pengumuman Aksesibel untuk Screen Reader */}
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {pesanReset}
        </p>

        <ProgressResetDialog
          terbuka={dialogResetTerbuka}
          pemicuRef={pemicuResetRef}
          onClose={() => setDialogResetTerbuka(false)}
          onConfirm={hapusProgres}
        />
      </main>
    </>
  );

  function renderCard(topikId: string) {
    const topik = topicRegistry.find((t) => t.id === topikId);
    if (!topik) return null;

    return (
      <TopicCard
        key={topik.id}
        topik={topik}
        skor={semuaSkor[topik.id] ?? null}
        onPrefetch={jadwalkanPrefetch}
      />
    );
  }
}
