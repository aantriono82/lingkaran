import { buatRng } from '../../../lib/quiz/rng';

export interface BendaLingkaran {
  id: string;
  nama: string;
  diameter: number;
}

export type ModePengukuran = 'manual' | 'ideal';

export const bendaLingkaran: BendaLingkaran[] = [
  { id: 'koin', nama: 'Koin', diameter: 2.4 },
  { id: 'tutup-botol', nama: 'Tutup botol', diameter: 3 },
  { id: 'cd', nama: 'CD', diameter: 12 },
  { id: 'piring', nama: 'Piring', diameter: 24 },
  { id: 'jam-dinding', nama: 'Jam dinding', diameter: 30 },
  { id: 'roda-sepeda', nama: 'Roda sepeda', diameter: 66 }
];

function tetanggaFloating(nilai: number, arah: 1 | -1): number {
  if (nilai === 0) return arah > 0 ? Number.MIN_VALUE : -Number.MIN_VALUE;
  const buffer = new ArrayBuffer(8);
  const tampilan = new DataView(buffer);
  tampilan.setFloat64(0, nilai);
  let bit = tampilan.getBigUint64(0);
  bit += BigInt(arah);
  tampilan.setBigUint64(0, bit);
  return tampilan.getFloat64(0);
}

function kelilingIdeal(diameter: number): number {
  const hasil = Math.PI * diameter;
  if (hasil / diameter === Math.PI) return hasil;
  const kandidat = [tetanggaFloating(hasil, -1), tetanggaFloating(hasil, 1)];
  return kandidat.find((nilai) => nilai / diameter === Math.PI) ?? hasil;
}

export function ukurKeliling(diameter: number, mode: ModePengukuran, seed = 1): number {
  const d = Number.isFinite(diameter) ? Math.max(0.01, diameter) : 1;
  const kelilingTepat = kelilingIdeal(d);
  if (mode === 'ideal') return kelilingTepat;

  const rng = buatRng(seed);
  const batasGalat = Math.max(0.1, kelilingTepat * 0.005);
  const galat = (rng() * 2 - 1) * batasGalat;
  return kelilingTepat + galat;
}

export function rataRata(rasio: number[]): number {
  if (rasio.length === 0) return 0;
  return rasio.reduce((jumlah, nilai) => jumlah + nilai, 0) / rasio.length;
}
