import type { Point } from './types';

export function buatTitik(x: number, y: number): Point {
  return { x, y };
}

export function tambah(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function kurang(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function kali(a: Point, skalar: number): Point {
  return { x: a.x * skalar, y: a.y * skalar };
}

export function jarak(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function titikTengah(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function sudutArah(pusat: Point, titik: Point): number {
  return Math.atan2(titik.y - pusat.y, titik.x - pusat.x);
}

export function titikDariSudut(pusat: Point, radius: number, sudut: number): Point {
  return { x: pusat.x + radius * Math.cos(sudut), y: pusat.y + radius * Math.sin(sudut) };
}

export function normalisasiSudut(sudut: number): number {
  const duaPi = Math.PI * 2;
  return ((sudut % duaPi) + duaPi) % duaPi;
}

export function bedaSudutKecil(a: number, b: number): number {
  const selisih = Math.abs(normalisasiSudut(a) - normalisasiSudut(b));
  return Math.min(selisih, Math.PI * 2 - selisih);
}

export function derajat(radian: number): number {
  return (radian * 180) / Math.PI;
}

export function radian(derajatNilai: number): number {
  return (derajatNilai * Math.PI) / 180;
}

export function proyeksiKeGaris(titik: Point, awal: Point, akhir: Point): Point {
  const dx = akhir.x - awal.x;
  const dy = akhir.y - awal.y;
  const panjangKuadrat = dx * dx + dy * dy;
  if (panjangKuadrat === 0) return awal;
  const t = ((titik.x - awal.x) * dx + (titik.y - awal.y) * dy) / panjangKuadrat;
  return { x: awal.x + t * dx, y: awal.y + t * dy };
}

export function proyeksiKeSegmen(titik: Point, awal: Point, akhir: Point): Point {
  const dx = akhir.x - awal.x;
  const dy = akhir.y - awal.y;
  const panjangKuadrat = dx * dx + dy * dy;
  if (panjangKuadrat === 0) return awal;
  const t = Math.max(0, Math.min(1, ((titik.x - awal.x) * dx + (titik.y - awal.y) * dy) / panjangKuadrat));
  return { x: awal.x + t * dx, y: awal.y + t * dy };
}
