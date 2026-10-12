/**
 * Sistem Token Desain Arah B: Modern Interactive Classroom
 * Digunakan pada CSS Variables dan referensi tema di modul.
 */

export const WARNA_TEMA = {
  latar: '#f0f5fa',
  permukaan: '#ffffff',
  permukaanElevasi: '#ffffff',
  permukaanRedup: '#f8fbfe',
  utama: '#123e6d',
  utamaMuda: '#e5f0fa',
  utamaHover: '#0c2d52',
  aksen: '#f59e0b',
  aksenMuda: '#fef3c7',
  teks: '#0e2238',
  teksLembut: '#334e68',
  garis: '#d0e0ee',
  garisFokus: '#0284c7',
  destruktif: '#dc2626',
  destruktifHover: '#b91c1c',
  sukses: '#15803d',
  suksesMuda: '#dcfce7',
  peringatan: '#b45309',
  peringatanMuda: '#fef3c7',
  bahaya: '#b91c1c',
  bahayaMuda: '#fee2e2'
} as const;

export const WARNA_GEOMETRI = {
  radius: '#0284c7',
  diameter: '#dc2626',
  taliBusur: '#059669',
  busur: '#7c3aed',
  juring: '#ea580c',
  tembereng: '#d97706',
  apotema: '#e11d48',
  titikPusat: '#123e6d',
  pusat: '#123e6d',
  potong: '#dc2626',
  susun: '#0284c7',
  segiEmpatA: '#d97706',
  segiEmpatB: '#7c3aed',
  garisBagi: '#ea580c',
  lingkaranDalam: '#059669',
  sumbuSisi: '#0284c7',
  lingkaranLuar: '#7c3aed',
  singgung: '#e11d48',
  titikSinggung: '#123e6d',
  kedudukanA: '#d97706',
  kedudukanB: '#0284c7',
  titikPersekutuan: '#dc2626',
  garisUkur: '#d97706',
  garisBatasBawah: '#059669',
  garisBatasAtas: '#dc2626'
} as const;

/**
 * Palet Tema Gelap (Dark Mode)
 * Terkalibrasi rasio kontras WCAG AAA / AA terhadap kanvas gelap (#0b1320 / #132238)
 */
export const WARNA_TEMA_GELAP = {
  latar: '#0b1320',
  permukaan: '#132238',
  permukaanElevasi: '#192d4a',
  permukaanRedup: '#0f1c30',
  utama: '#38bdf8',
  utamaMuda: '#153354',
  utamaHover: '#7dd3fc',
  aksen: '#fbbf24',
  aksenMuda: '#382d12',
  teks: '#f1f5f9',
  teksLembut: '#94a3b8',
  garis: '#223a5e',
  garisFokus: '#38bdf8',
  destruktif: '#ef4444',
  destruktifHover: '#f87171',
  sukses: '#22c55e',
  suksesMuda: '#143521',
  peringatan: '#f59e0b',
  peringatanMuda: '#3a2b0e',
  bahaya: '#f87171',
  bahayaMuda: '#3b1717'
} as const;

export const WARNA_GEOMETRI_GELAP = {
  radius: '#38bdf8',
  diameter: '#f87171',
  taliBusur: '#34d399',
  busur: '#a78bfa',
  juring: '#fb923c',
  tembereng: '#fbbf24',
  apotema: '#fb7185',
  titikPusat: '#e2e8f0',
  pusat: '#e2e8f0',
  potong: '#f87171',
  susun: '#38bdf8',
  segiEmpatA: '#fb923c',
  segiEmpatB: '#a78bfa',
  garisBagi: '#fb923c',
  lingkaranDalam: '#34d399',
  sumbuSisi: '#38bdf8',
  lingkaranLuar: '#a78bfa',
  singgung: '#fb7185',
  titikSinggung: '#e2e8f0',
  kedudukanA: '#fb923c',
  kedudukanB: '#38bdf8',
  titikPersekutuan: '#f87171',
  garisUkur: '#fb923c',
  garisBatasBawah: '#34d399',
  garisBatasAtas: '#f87171'
} as const;
