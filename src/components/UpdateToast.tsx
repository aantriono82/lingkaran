import { useEffect, useState } from 'react';
import { bolehMuatUlangPembaruan } from './updatePolicy';

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;
interface UpdateEventDetail { updateSW?: UpdateServiceWorker; }

export function UpdateToast() {
  const [tersedia, setTersedia] = useState(false);
  const [kuisBerjalan, setKuisBerjalan] = useState(false);
  const [updateSW, setUpdateSW] = useState<UpdateServiceWorker | null>(null);

  useEffect(() => {
    const tampilkan = (event: Event) => {
      const detail = (event as CustomEvent<UpdateEventDetail>).detail;
      if (detail?.updateSW) setUpdateSW(() => detail.updateSW ?? null);
      setTersedia(true);
    };
    const ubahAktivitas = (event: Event) => {
      setKuisBerjalan(Boolean((event as CustomEvent<{ aktif?: boolean }>).detail?.aktif));
    };
    window.addEventListener('pwa-update-available', tampilkan);
    window.addEventListener('quiz-activity', ubahAktivitas);
    return () => {
      window.removeEventListener('pwa-update-available', tampilkan);
      window.removeEventListener('quiz-activity', ubahAktivitas);
    };
  }, []);

  useEffect(() => {
    if (!bolehMuatUlangPembaruan({ kuisBerjalan, pembaruanTersedia: tersedia }) || !updateSW) return;
    void updateSW(true);
  }, [kuisBerjalan, tersedia, updateSW]);

  async function muatUlang(): Promise<void> {
    if (!bolehMuatUlangPembaruan({ kuisBerjalan, pembaruanTersedia: tersedia })) return;
    if (updateSW) await updateSW(true);
    else window.location.reload();
  }

  if (!tersedia) return null;
  return (
    <div className="update-toast" role="status" aria-live="polite">
      <span>{kuisBerjalan ? 'Versi baru siap. Muat ulang setelah kuis selesai.' : 'Versi baru tersedia.'}</span>
      <button className="button primary" onClick={() => { void muatUlang(); }} disabled={kuisBerjalan}>
        Muat ulang
      </button>
    </div>
  );
}
