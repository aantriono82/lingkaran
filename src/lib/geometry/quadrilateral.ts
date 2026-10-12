import { sudutDiTitik } from './angle';
import { jarak, proyeksiKeSegmen } from './point';
import { EPSILON, type Point } from './types';

export interface AnalisisSegiEmpat {
  sederhana: boolean;
  siklik: boolean;
  sudut: number[];
  jumlahBerhadapan: [number, number];
}

function silang(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function diAntara(a: Point, b: Point, c: Point): boolean {
  return c.x >= Math.min(a.x, b.x) - EPSILON && c.x <= Math.max(a.x, b.x) + EPSILON
    && c.y >= Math.min(a.y, b.y) - EPSILON && c.y <= Math.max(a.y, b.y) + EPSILON;
}

function segmenBerpotongan(a: Point, b: Point, c: Point, d: Point): boolean {
  const abC = silang(a, b, c);
  const abD = silang(a, b, d);
  const cdA = silang(c, d, a);
  const cdB = silang(c, d, b);
  const toleransi = 1e-8 * Math.max(1, jarak(a, b), jarak(c, d)) ** 2;
  if (Math.abs(abC) <= toleransi && diAntara(a, b, c)) return true;
  if (Math.abs(abD) <= toleransi && diAntara(a, b, d)) return true;
  if (Math.abs(cdA) <= toleransi && diAntara(c, d, a)) return true;
  if (Math.abs(cdB) <= toleransi && diAntara(c, d, b)) return true;
  return (abC > toleransi) !== (abD > toleransi) && (cdA > toleransi) !== (cdB > toleransi);
}

function luasBertanda(titik: Point[]): number {
  return titik.reduce((total, item, indeks) => {
    const berikutnya = titik[(indeks + 1) % titik.length];
    return total + item.x * berikutnya.y - berikutnya.x * item.y;
  }, 0) / 2;
}

export function segiEmpatSederhana(titik: Point[]): boolean {
  if (titik.length !== 4 || titik.some((item) => !Number.isFinite(item.x) || !Number.isFinite(item.y))) return false;
  if (titik.some((item, indeks) => jarak(item, titik[(indeks + 1) % 4]) <= EPSILON)) return false;
  if (Math.abs(luasBertanda(titik)) <= EPSILON) return false;
  return !segmenBerpotongan(titik[0], titik[1], titik[2], titik[3])
    && !segmenBerpotongan(titik[1], titik[2], titik[3], titik[0]);
}

export function sudutDalamSegiEmpat(titik: Point[]): number[] {
  if (titik.length !== 4 || !segiEmpatSederhana(titik)) return [];
  const orientasi = luasBertanda(titik) >= 0 ? 1 : -1;
  return titik.map((puncak, indeks) => {
    const sebelum = titik[(indeks + 3) % 4];
    const sesudah = titik[(indeks + 1) % 4];
    const sudutKecil = sudutDiTitik(puncak, sebelum, sesudah);
    const cross = silang(sebelum, puncak, sesudah);
    const refleks = orientasi * cross < 0;
    return refleks ? Math.PI * 2 - sudutKecil : sudutKecil;
  });
}

export function analisisSegiEmpatTaliBusur(titik: Point[], toleransiDerajat = 0.5): AnalisisSegiEmpat {
  const sederhana = segiEmpatSederhana(titik);
  const sudut = sederhana ? sudutDalamSegiEmpat(titik) : [];
  const jumlahBerhadapan: [number, number] = sudut.length === 4
    ? [sudut[0] + sudut[2], sudut[1] + sudut[3]]
    : [0, 0];
  const toleransi = (toleransiDerajat * Math.PI) / 180;
  const siklik = sederhana && jumlahBerhadapan.every((nilai) => Math.abs(nilai - Math.PI) <= toleransi);
  return { sederhana, siklik, sudut, jumlahBerhadapan };
}

export function titikSinggungDariPusat(pusat: Point, awal: Point, akhir: Point): Point {
  return proyeksiKeSegmen(pusat, awal, akhir);
}
