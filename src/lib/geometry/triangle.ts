import type { Point } from './types';
import { jarak, proyeksiKeGaris } from './point';

export function luasSegitiga(a: Point, b: Point, c: Point): number {
  return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
}

export function sisiSegitiga(a: Point, b: Point, c: Point): { a: number; b: number; c: number } {
  return { a: jarak(b, c), b: jarak(a, c), c: jarak(a, b) };
}

export function pusatDalamSegitiga(a: Point, b: Point, c: Point): Point {
  const sisi = sisiSegitiga(a, b, c);
  const total = sisi.a + sisi.b + sisi.c;
  if (!Number.isFinite(total) || total < 1e-9) return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
  return {
    x: (sisi.a * a.x + sisi.b * b.x + sisi.c * c.x) / total,
    y: (sisi.a * a.y + sisi.b * b.y + sisi.c * c.y) / total
  };
}

export function pusatLuarSegitiga(a: Point, b: Point, c: Point): Point {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (!Number.isFinite(d) || Math.abs(d) < 1e-9) return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
  const aKuadrat = a.x ** 2 + a.y ** 2;
  const bKuadrat = b.x ** 2 + b.y ** 2;
  const cKuadrat = c.x ** 2 + c.y ** 2;
  const hasil = {
    x: (aKuadrat * (b.y - c.y) + bKuadrat * (c.y - a.y) + cKuadrat * (a.y - b.y)) / d,
    y: (aKuadrat * (c.x - b.x) + bKuadrat * (a.x - c.x) + cKuadrat * (b.x - a.x)) / d
  };
  return Number.isFinite(hasil.x) && Number.isFinite(hasil.y)
    ? hasil
    : { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
}

export function jarakKeSisi(titik: Point, awal: Point, akhir: Point): number {
  return jarak(titik, proyeksiKeGaris(titik, awal, akhir));
}

export type JenisSegitiga = 'lancip' | 'siku-siku' | 'tumpul' | 'tidak valid';
export type LetakPusatLuar = 'di dalam' | 'pada sisi miring' | 'di luar' | 'tidak tersedia';

export interface AnalisisSegitiga {
  sisi: { a: number; b: number; c: number };
  luas: number;
  setengahKeliling: number;
  valid: boolean;
  pusatDalam: Point;
  radiusDalam: number;
  titikSinggung: [Point, Point, Point];
  pusatLuar: Point;
  radiusLuar: number;
  jenis: JenisSegitiga;
  letakPusatLuar: LetakPusatLuar;
}

function pusatRataRata(a: Point, b: Point, c: Point): Point {
  return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
}

export function segitigaHampirDegenerat(a: Point, b: Point, c: Point): boolean {
  const sisi = sisiSegitiga(a, b, c);
  const luas = luasSegitiga(a, b, c);
  const skala = Math.max(sisi.a, sisi.b, sisi.c);
  return !Number.isFinite(luas) || !Number.isFinite(skala) || skala <= 1e-9 || luas <= 1e-7 * skala ** 2;
}

export function klasifikasiSegitiga(sisi: { a: number; b: number; c: number }): JenisSegitiga {
  const kuadrat = [sisi.a ** 2, sisi.b ** 2, sisi.c ** 2].sort((a, b) => a - b);
  const toleransi = Math.max(1, kuadrat[2]) * 1e-4;
  if (kuadrat[0] + kuadrat[1] > kuadrat[2] + toleransi) return 'lancip';
  if (Math.abs(kuadrat[0] + kuadrat[1] - kuadrat[2]) <= toleransi) return 'siku-siku';
  return 'tumpul';
}

export function garisSumbuSisi(awal: Point, akhir: Point, panjang = 180): { awal: Point; akhir: Point } | null {
  const dx = akhir.x - awal.x;
  const dy = akhir.y - awal.y;
  const sisi = Math.hypot(dx, dy);
  if (!Number.isFinite(sisi) || sisi <= 1e-9 || !Number.isFinite(panjang) || panjang <= 0) return null;
  const tengah = { x: (awal.x + akhir.x) / 2, y: (awal.y + akhir.y) / 2 };
  const normal = { x: -dy / sisi, y: dx / sisi };
  const setengah = panjang / 2;
  return {
    awal: { x: tengah.x - normal.x * setengah, y: tengah.y - normal.y * setengah },
    akhir: { x: tengah.x + normal.x * setengah, y: tengah.y + normal.y * setengah }
  };
}

export function analisisSegitiga(a: Point, b: Point, c: Point): AnalisisSegitiga {
  const sisi = sisiSegitiga(a, b, c);
  const luas = luasSegitiga(a, b, c);
  const setengahKeliling = (sisi.a + sisi.b + sisi.c) / 2;
  const valid = !segitigaHampirDegenerat(a, b, c) && setengahKeliling > 1e-9;
  const pusatRata = pusatRataRata(a, b, c);
  const pusatDalam = valid ? pusatDalamSegitiga(a, b, c) : pusatRata;
  const radiusDalam = valid ? luas / setengahKeliling : 0;
  const titikSinggung: [Point, Point, Point] = [
    proyeksiKeGaris(pusatDalam, b, c),
    proyeksiKeGaris(pusatDalam, a, c),
    proyeksiKeGaris(pusatDalam, a, b)
  ];
  const pusatLuar = valid ? pusatLuarSegitiga(a, b, c) : pusatRata;
  const radiusLuar = valid ? (sisi.a * sisi.b * sisi.c) / (4 * luas) : 0;
  const jenis = valid ? klasifikasiSegitiga(sisi) : 'tidak valid';
  const letakPusatLuar: LetakPusatLuar = !valid
    ? 'tidak tersedia'
    : jenis === 'lancip' ? 'di dalam'
      : jenis === 'siku-siku' ? 'pada sisi miring'
        : 'di luar';
  return {
    sisi,
    luas: Number.isFinite(luas) ? luas : 0,
    setengahKeliling: Number.isFinite(setengahKeliling) ? setengahKeliling : 0,
    valid,
    pusatDalam,
    radiusDalam: Number.isFinite(radiusDalam) ? radiusDalam : 0,
    titikSinggung,
    pusatLuar,
    radiusLuar: Number.isFinite(radiusLuar) ? radiusLuar : 0,
    jenis,
    letakPusatLuar
  };
}
