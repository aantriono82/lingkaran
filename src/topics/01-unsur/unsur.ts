export type Unsur =
  | 'pusat'
  | 'jariJari'
  | 'diameter'
  | 'taliBusur'
  | 'busur'
  | 'juring'
  | 'tembereng'
  | 'apotema';

export type GayaUnsur = 'titik' | 'solid' | 'tebal' | 'putus' | 'busur' | 'isi';

export interface UnsurInfo {
  nama: string;
  definisi: string;
  warna: string;
  gaya: GayaUnsur;
  nomor: number;
  label: string;
}

export const SEMUA_UNSUR = [
  'pusat',
  'jariJari',
  'diameter',
  'taliBusur',
  'busur',
  'juring',
  'tembereng',
  'apotema'
] as const satisfies readonly Unsur[];

export const UNSUR_AWAL = ['jariJari'] as const satisfies readonly Unsur[];

export const UNSUR_INFO: Record<Unsur, UnsurInfo> = {
  pusat: {
    nama: 'Titik pusat',
    definisi: 'Titik di tengah lingkaran yang berjarak sama ke semua titik pada lingkaran.',
    warna: 'var(--warna-pusat)',
    gaya: 'titik',
    nomor: 1,
    label: 'Pusat O'
  },
  jariJari: {
    nama: 'Jari-jari',
    definisi: 'Ruas garis dari titik pusat ke satu titik pada lingkaran.',
    warna: 'var(--warna-radius)',
    gaya: 'solid',
    nomor: 2,
    label: 'r'
  },
  diameter: {
    nama: 'Diameter',
    definisi: 'Tali busur yang melalui titik pusat dan panjangnya dua kali jari-jari.',
    warna: 'var(--warna-diameter)',
    gaya: 'tebal',
    nomor: 3,
    label: 'd'
  },
  taliBusur: {
    nama: 'Tali busur',
    definisi: 'Ruas garis yang menghubungkan dua titik pada lingkaran.',
    warna: 'var(--warna-tali-busur)',
    gaya: 'putus',
    nomor: 4,
    label: 'AB'
  },
  busur: {
    nama: 'Busur',
    definisi: 'Bagian dari keliling lingkaran yang menghubungkan dua titik pada lingkaran.',
    warna: 'var(--warna-busur)',
    gaya: 'busur',
    nomor: 5,
    label: '⌒AB'
  },
  juring: {
    nama: 'Juring',
    definisi: 'Daerah yang dibatasi oleh dua jari-jari dan satu busur.',
    warna: 'var(--warna-juring)',
    gaya: 'isi',
    nomor: 6,
    label: 'Juring'
  },
  tembereng: {
    nama: 'Tembereng',
    definisi: 'Daerah yang dibatasi oleh satu tali busur dan satu busur.',
    warna: 'var(--warna-tembereng)',
    gaya: 'isi',
    nomor: 7,
    label: 'Tembereng'
  },
  apotema: {
    nama: 'Apotema',
    definisi: 'Jarak tegak lurus dari titik pusat ke sebuah tali busur.',
    warna: 'var(--warna-apotema)',
    gaya: 'putus',
    nomor: 8,
    label: 'a'
  }
};

export function buatSemuaUnsur(): Set<Unsur> {
  return new Set(SEMUA_UNSUR);
}

export function kosongkanUnsur(): Set<Unsur> {
  return new Set<Unsur>();
}

export function buatUnsurAwal(): Set<Unsur> {
  return new Set(UNSUR_AWAL);
}

export function toggleUnsur(aktif: ReadonlySet<Unsur>, id: Unsur): Set<Unsur> {
  const berikutnya = new Set(aktif);
  if (berikutnya.has(id)) berikutnya.delete(id);
  else berikutnya.add(id);
  return berikutnya;
}

export function adalahSemuaUnsur(aktif: ReadonlySet<Unsur>): boolean {
  return aktif.size === SEMUA_UNSUR.length && SEMUA_UNSUR.every((id) => aktif.has(id));
}
