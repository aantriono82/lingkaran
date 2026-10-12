import type { CircleData, Point } from './types';
import { jarak } from './point';

export type JenisGarisSinggungPersekutuan = 'luar' | 'dalam';

export interface GarisSinggungPersekutuan {
  titikA: Point;
  titikB: Point;
  panjang: number;
}

const TOLERANSI_SINGGUNG = 1e-8;

function radiusAman(nilai: number): number {
  return Number.isFinite(nilai) ? Math.max(0, nilai) : 0;
}

function titikAman(titik: Point): boolean {
  return Number.isFinite(titik.x) && Number.isFinite(titik.y);
}

export function panjangGarisSinggung(lingkaran: CircleData, titikLuar: Point): number {
  if (!titikAman(lingkaran.pusat) || !titikAman(titikLuar)) return 0;
  const jarakPusat = jarak(lingkaran.pusat, titikLuar);
  const radius = radiusAman(lingkaran.jariJari);
  if (!Number.isFinite(jarakPusat) || jarakPusat < radius) return 0;
  return Math.sqrt(Math.max(0, jarakPusat ** 2 - radius ** 2));
}

export function garisSinggungDariTitikLuar(lingkaran: CircleData, titikLuar: Point): Point[] {
  if (!titikAman(lingkaran.pusat) || !titikAman(titikLuar)) return [];
  const vx = titikLuar.x - lingkaran.pusat.x;
  const vy = titikLuar.y - lingkaran.pusat.y;
  const jarakKuadrat = vx * vx + vy * vy;
  const radius = radiusAman(lingkaran.jariJari);
  if (!Number.isFinite(jarakKuadrat) || jarakKuadrat <= TOLERANSI_SINGGUNG ** 2) return [];
  const jarakPusat = Math.sqrt(jarakKuadrat);
  if (jarakPusat < radius - TOLERANSI_SINGGUNG) return [];
  if (Math.abs(jarakPusat - radius) <= TOLERANSI_SINGGUNG) {
    const skala = radius / jarakPusat;
    return [{ x: lingkaran.pusat.x + vx * skala, y: lingkaran.pusat.y + vy * skala }];
  }
  const sepanjang = radius * radius / jarakPusat;
  const tegak = radius * Math.sqrt(Math.max(0, jarakKuadrat - radius * radius)) / jarakPusat;
  const unit = { x: vx / jarakPusat, y: vy / jarakPusat };
  const kaki = {
    x: lingkaran.pusat.x + sepanjang * unit.x,
    y: lingkaran.pusat.y + sepanjang * unit.y
  };
  const hasil = [
    { x: kaki.x - tegak * unit.y, y: kaki.y + tegak * unit.x },
    { x: kaki.x + tegak * unit.y, y: kaki.y - tegak * unit.x }
  ];
  return hasil.every(titikAman) ? hasil : [];
}

/**
 * Menghasilkan paling banyak dua garis singgung persekutuan untuk satu jenis.
 * tanda radius +1 berarti garis luar, sedangkan -1 berarti garis dalam.
 */
export function garisSinggungPersekutuan(
  a: CircleData,
  b: CircleData,
  jenis: JenisGarisSinggungPersekutuan
): GarisSinggungPersekutuan[] {
  if (!titikAman(a.pusat) || !titikAman(b.pusat)) return [];
  const radiusA = radiusAman(a.jariJari);
  const radiusB = radiusAman(b.jariJari);
  const vx = b.pusat.x - a.pusat.x;
  const vy = b.pusat.y - a.pusat.y;
  const d = Math.hypot(vx, vy);
  if (!Number.isFinite(d) || d <= TOLERANSI_SINGGUNG) return [];
  if (jenis === 'dalam' && d <= radiusA + radiusB + TOLERANSI_SINGGUNG) return [];
  if (jenis === 'luar' && d <= Math.abs(radiusA - radiusB) + TOLERANSI_SINGGUNG) return [];

  const tanda = jenis === 'luar' ? 1 : -1;
  const bedaRadius = radiusA - tanda * radiusB;
  const tinggiKuadrat = d * d - bedaRadius * bedaRadius;
  if (tinggiKuadrat < -TOLERANSI_SINGGUNG * Math.max(1, d * d)) return [];

  const tinggi = Math.sqrt(Math.max(0, tinggiKuadrat));
  const penyebut = d * d;
  const hasil: GarisSinggungPersekutuan[] = [];
  const pilihan = tinggi <= TOLERANSI_SINGGUNG ? [1] : [1, -1];
  for (const arah of pilihan) {
    const nx = (vx * bedaRadius - arah * vy * tinggi) / penyebut;
    const ny = (vy * bedaRadius + arah * vx * tinggi) / penyebut;
    const titikA = { x: a.pusat.x + nx * radiusA, y: a.pusat.y + ny * radiusA };
    const titikB = { x: b.pusat.x + nx * tanda * radiusB, y: b.pusat.y + ny * tanda * radiusB };
    const panjang = Math.hypot(titikB.x - titikA.x, titikB.y - titikA.y);
    if (titikAman(titikA) && titikAman(titikB) && Number.isFinite(panjang)) {
      hasil.push({ titikA, titikB, panjang });
    }
  }
  return hasil;
}
