import { sudutDiTitik } from './angle';
import { jarak, normalisasiSudut, sudutArah } from './point';
import { EPSILON, type Point } from './types';

export interface TitikBersudut {
  indeks: number;
  titik: Point;
  sudut: number;
}

export interface AnalisisSudutDuaTaliBusur {
  potong: Point | null;
  diDalam: boolean;
  sudut: number;
  busurPertama: number;
  busurKedua: number;
  indeksDekat: [number, number];
  indeksJauh: [number, number];
}

export function urutkanTitikLingkaran(titik: Point[], pusat: Point): TitikBersudut[] {
  return titik
    .map((nilai, indeks) => ({ indeks, titik: nilai, sudut: normalisasiSudut(sudutArah(pusat, nilai)) }))
    .sort((a, b) => a.sudut - b.sudut);
}

export function besarBusurKecil(sudutA: number, sudutB: number): number {
  const selisih = Math.abs(normalisasiSudut(sudutA) - normalisasiSudut(sudutB));
  return Math.min(selisih, Math.PI * 2 - selisih);
}

function beradaDiJalurMaju(sudutAwal: number, sudutAkhir: number, sudutUji: number): boolean {
  const panjang = normalisasiSudut(sudutAkhir - sudutAwal);
  const posisi = normalisasiSudut(sudutUji - sudutAwal);
  return posisi > 1e-7 && posisi < panjang - 1e-7;
}

export function busurTanpaTitik(sudutA: number, sudutB: number, sudutTerlarang: number[]): number {
  const maju = normalisasiSudut(sudutB - sudutA);
  if (sudutTerlarang.every((sudut) => !beradaDiJalurMaju(sudutA, sudutB, sudut))) return maju;
  return Math.PI * 2 - maju;
}

export function rentangBusurTanpaTitik(sudutA: number, sudutB: number, sudutTerlarang: number[]): [number, number] {
  const maju = normalisasiSudut(sudutB - sudutA);
  return sudutTerlarang.every((sudut) => !beradaDiJalurMaju(sudutA, sudutB, sudut))
    ? [sudutA, sudutA + maju]
    : [sudutB, sudutB + Math.PI * 2 - maju];
}

function silang(a: Point, b: Point): number {
  return a.x * b.y - a.y * b.x;
}

function potongDuaGaris(a: Point, b: Point, c: Point, d: Point): Point | null {
  const arahA = { x: b.x - a.x, y: b.y - a.y };
  const arahB = { x: d.x - c.x, y: d.y - c.y };
  const penyebut = silang(arahA, arahB);
  const skala = Math.hypot(arahA.x, arahA.y) * Math.hypot(arahB.x, arahB.y);
  if (!Number.isFinite(skala) || skala < EPSILON || Math.abs(penyebut) <= skala * 1e-8) return null;
  const dariA = { x: c.x - a.x, y: c.y - a.y };
  const t = silang(dariA, arahB) / penyebut;
  const hasil = { x: a.x + t * arahA.x, y: a.y + t * arahA.y };
  return Number.isFinite(hasil.x) && Number.isFinite(hasil.y) ? hasil : null;
}

export function analisisDuaTaliBusur(titik: Point[], pusat: Point, radius: number): AnalisisSudutDuaTaliBusur {
  const kosong: AnalisisSudutDuaTaliBusur = { potong: null, diDalam: false, sudut: 0, busurPertama: 0, busurKedua: 0, indeksDekat: [0, 2], indeksJauh: [1, 3] };
  if (titik.length < 4 || !Number.isFinite(radius) || radius <= EPSILON || titik.slice(0, 4).some((item) => !Number.isFinite(item.x) || !Number.isFinite(item.y))) return kosong;
  if ([
    jarak(titik[0], titik[1]),
    jarak(titik[2], titik[3])
  ].some((nilai) => !Number.isFinite(nilai) || nilai <= EPSILON)) return kosong;
  const potong = potongDuaGaris(titik[0], titik[1], titik[2], titik[3]);
  if (!potong) return kosong;
  const diDalam = jarak(pusat, potong) < radius - 1e-7;
  const sudutTitik = Array<number>(titik.length);
  for (const item of urutkanTitikLingkaran(titik, pusat)) sudutTitik[item.indeks] = item.sudut;
  if (diDalam) {
    const sudut = sudutDiTitik(potong, titik[0], titik[2]);
    if (!Number.isFinite(sudut)) return kosong;
    return {
      potong,
      diDalam,
      sudut,
      busurPertama: busurTanpaTitik(sudutTitik[0], sudutTitik[2], [sudutTitik[1], sudutTitik[3]]),
      busurKedua: busurTanpaTitik(sudutTitik[1], sudutTitik[3], [sudutTitik[0], sudutTitik[2]]),
      indeksDekat: [0, 2],
      indeksJauh: [1, 3]
    };
  }
  const pertamaDekat = jarak(potong, titik[0]) <= jarak(potong, titik[1]) ? 0 : 1;
  const keduaDekat = jarak(potong, titik[2]) <= jarak(potong, titik[3]) ? 2 : 3;
  const pertamaJauh = pertamaDekat === 0 ? 1 : 0;
  const keduaJauh = keduaDekat === 2 ? 3 : 2;
  const sudut = sudutDiTitik(potong, titik[pertamaDekat], titik[keduaDekat]);
  if (!Number.isFinite(sudut)) return kosong;
  return {
    potong,
    diDalam,
    sudut,
    busurPertama: busurTanpaTitik(sudutTitik[pertamaJauh], sudutTitik[keduaJauh], [sudutTitik[pertamaDekat], sudutTitik[keduaDekat]]),
    busurKedua: busurTanpaTitik(sudutTitik[pertamaDekat], sudutTitik[keduaDekat], [sudutTitik[pertamaJauh], sudutTitik[keduaJauh]]),
    indeksDekat: [pertamaDekat, keduaDekat],
    indeksJauh: [pertamaJauh, keduaJauh]
  };
}
