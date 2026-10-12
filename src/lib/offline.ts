import { useEffect, useState } from 'react';

export type StatusOffline = 'siap' | 'menunggu' | 'tidak-didukung';

export interface KondisiOffline {
  dukunganServiceWorker: boolean;
  eventOfflineDiterima: boolean;
  swTerkontrol: boolean;
}

/**
 * Menentukan status kesiapan offline aplikasi (fungsi murni).
 *
 * Sesuai aturan:
 * - Tidak boleh mengklaim "100% offline" secara permanen tanpa sinyal terpercaya.
 * - Berstatus 'siap' HANYA jika event pwa-offline-ready diterima atau
 *   service worker aktif sedang mengendalikan dokumen (cache precache terbukti ada).
 * - Jika browser tidak mendukung service worker, berstatus 'tidak-didukung'.
 * - Selain itu, berstatus 'menunggu' (sembunyikan lencana atau tampilkan netral tanpa klaim palsu).
 */
export function tentukanStatusOffline({
  dukunganServiceWorker,
  eventOfflineDiterima,
  swTerkontrol
}: KondisiOffline): StatusOffline {
  if (!dukunganServiceWorker) return 'tidak-didukung';
  if (eventOfflineDiterima || swTerkontrol) return 'siap';
  return 'menunggu';
}

/**
 * Hook reaktif untuk memantau sinyal kesiapan offline service worker.
 */
export function useOfflineReady(): { siap: boolean; status: StatusOffline } {
  const [eventDiterima, setEventDiterima] = useState(false);

  useEffect(() => {
    const tangani = () => setEventDiterima(true);
    window.addEventListener('pwa-offline-ready', tangani);
    return () => window.removeEventListener('pwa-offline-ready', tangani);
  }, []);

  const dukungan = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const terkontrol = typeof navigator !== 'undefined' && Boolean(navigator.serviceWorker?.controller);

  const status = tentukanStatusOffline({
    dukunganServiceWorker: dukungan,
    eventOfflineDiterima: eventDiterima,
    swTerkontrol: terkontrol
  });

  return {
    siap: status === 'siap',
    status
  };
}
