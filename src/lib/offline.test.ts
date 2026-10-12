import { describe, expect, it } from 'vitest';
import { tentukanStatusOffline } from './offline';

describe('logika status lencana siap offline', () => {
  it('mengembalikan "tidak-didukung" jika browser tidak memiliki Service Worker API', () => {
    const status = tentukanStatusOffline({
      dukunganServiceWorker: false,
      eventOfflineDiterima: false,
      swTerkontrol: false
    });
    expect(status).toBe('tidak-didukung');
  });

  it('mengembalikan "menunggu" sebelum ada callback cache selesai dan SW belum terkontrol', () => {
    const status = tentukanStatusOffline({
      dukunganServiceWorker: true,
      eventOfflineDiterima: false,
      swTerkontrol: false
    });
    expect(status).toBe('menunggu');
  });

  it('mengembalikan "siap" setelah event pwa-offline-ready diterima pertama kali', () => {
    const status = tentukanStatusOffline({
      dukunganServiceWorker: true,
      eventOfflineDiterima: true,
      swTerkontrol: false
    });
    expect(status).toBe('siap');
  });

  it('mengembalikan "siap" jika halaman dibuka kembali dengan service worker controller aktif', () => {
    const status = tentukanStatusOffline({
      dukunganServiceWorker: true,
      eventOfflineDiterima: false,
      swTerkontrol: true
    });
    expect(status).toBe('siap');
  });

  it('tidak menampilkan klaim jika dukungan SW tidak ada meskipun flag liar aktif', () => {
    const status = tentukanStatusOffline({
      dukunganServiceWorker: false,
      eventOfflineDiterima: true,
      swTerkontrol: true
    });
    expect(status).toBe('tidak-didukung');
  });
});
