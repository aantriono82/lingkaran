import { EPSILON, type CircleData, type Point } from './types';
import { jarak, kurang, kali, tambah } from './point';

export type KedudukanDuaLingkaran =
  | 'saling lepas'
  | 'bersinggungan luar'
  | 'berpotongan di dua titik'
  | 'bersinggungan dalam'
  | 'satu di dalam yang lain'
  | 'sepusat'
  | 'sepusat/berimpit';

export interface AnalisisKedudukanDuaLingkaran {
  kedudukan: KedudukanDuaLingkaran;
  d: number;
  jumlahRadius: number;
  selisihRadius: number;
  jumlahTitikPersekutuan: 0 | 1 | 2;
  jumlahGarisSinggungPersekutuan: 0 | 1 | 2 | 3 | 4;
  titikPersekutuan: Point[];
}

const TOLERANSI_KEDUDUKAN = 1e-7;

function radiusAman(nilai: number): number {
  return Number.isFinite(nilai) ? Math.max(0, nilai) : 0;
}

export function titikPadaLingkaran(lingkaran: CircleData, sudut: number): Point {
  return {
    x: lingkaran.pusat.x + lingkaran.jariJari * Math.cos(sudut),
    y: lingkaran.pusat.y + lingkaran.jariJari * Math.sin(sudut)
  };
}

export function potongLingkaranGaris(
  lingkaran: CircleData,
  awal: Point,
  akhir: Point
): Point[] {
  const arah = kurang(akhir, awal);
  const relatif = kurang(awal, lingkaran.pusat);
  const a = arah.x * arah.x + arah.y * arah.y;
  if (a < EPSILON) return [];
  const b = 2 * (relatif.x * arah.x + relatif.y * arah.y);
  const c = relatif.x * relatif.x + relatif.y * relatif.y - lingkaran.jariJari ** 2;
  const diskriminan = b * b - 4 * a * c;
  if (diskriminan < -EPSILON) return [];
  if (Math.abs(diskriminan) <= EPSILON) {
    const t = -b / (2 * a);
    return [tambah(awal, kali(arah, t))];
  }
  const akar = Math.sqrt(diskriminan);
  const t1 = (-b - akar) / (2 * a);
  const t2 = (-b + akar) / (2 * a);
  return [tambah(awal, kali(arah, t1)), tambah(awal, kali(arah, t2))];
}

export function potongDuaLingkaran(a: CircleData, b: CircleData): Point[] {
  const d = jarak(a.pusat, b.pusat);
  const radiusA = radiusAman(a.jariJari);
  const radiusB = radiusAman(b.jariJari);
  if (!Number.isFinite(d) || d < EPSILON || d > radiusA + radiusB + TOLERANSI_KEDUDUKAN || d < Math.abs(radiusA - radiusB) - TOLERANSI_KEDUDUKAN) {
    return [];
  }
  const arahX = (b.pusat.x - a.pusat.x) / d;
  const arahY = (b.pusat.y - a.pusat.y) / d;
  const jarakProyeksi = (radiusA ** 2 - radiusB ** 2 + d ** 2) / (2 * d);
  const tinggiKuadrat = radiusA ** 2 - jarakProyeksi ** 2;
  if (!Number.isFinite(jarakProyeksi) || tinggiKuadrat < -TOLERANSI_KEDUDUKAN * Math.max(1, radiusA ** 2)) return [];
  const kaki = { x: a.pusat.x + arahX * jarakProyeksi, y: a.pusat.y + arahY * jarakProyeksi };
  if (tinggiKuadrat <= TOLERANSI_KEDUDUKAN * Math.max(1, radiusA ** 2)) return [kaki];
  const tinggi = Math.sqrt(Math.max(0, tinggiKuadrat));
  const tegakX = -arahY * tinggi;
  const tegakY = arahX * tinggi;
  return [
    { x: kaki.x + tegakX, y: kaki.y + tegakY },
    { x: kaki.x - tegakX, y: kaki.y - tegakY }
  ];
}

export function jarakPusat(a: CircleData, b: CircleData): number {
  return jarak(a.pusat, b.pusat);
}

export type CirclePosition =
  | 'sepusat/berimpit'
  | 'saling lepas'
  | 'bersinggungan luar'
  | 'berpotongan'
  | 'bersinggungan dalam'
  | 'satu di dalam yang lain';

export function klasifikasiDuaLingkaran(a: CircleData, b: CircleData): CirclePosition {
  const d = jarakPusat(a, b);
  const jumlah = a.jariJari + b.jariJari;
  const selisih = Math.abs(a.jariJari - b.jariJari);
  if (d < EPSILON && Math.abs(a.jariJari - b.jariJari) < EPSILON) return 'sepusat/berimpit';
  if (d > jumlah + EPSILON) return 'saling lepas';
  if (Math.abs(d - jumlah) <= EPSILON) return 'bersinggungan luar';
  if (d > selisih + EPSILON) return 'berpotongan';
  if (Math.abs(d - selisih) <= EPSILON) return 'bersinggungan dalam';
  return 'satu di dalam yang lain';
}

export function analisisKedudukanDuaLingkaran(a: CircleData, b: CircleData): AnalisisKedudukanDuaLingkaran {
  const radiusA = radiusAman(a.jariJari);
  const radiusB = radiusAman(b.jariJari);
  const d = jarak(a.pusat, b.pusat);
  const jumlahRadius = radiusA + radiusB;
  const selisihRadius = Math.abs(radiusA - radiusB);
  const toleransi = TOLERANSI_KEDUDUKAN * Math.max(1, jumlahRadius, d);
  const samaJarak = (nilai: number, target: number) => Math.abs(nilai - target) <= toleransi;
  let kedudukan: KedudukanDuaLingkaran;
  let jumlahTitikPersekutuan: 0 | 1 | 2;
  let jumlahGarisSinggungPersekutuan: 0 | 1 | 2 | 3 | 4;

  if (d <= toleransi) {
    kedudukan = Math.abs(radiusA - radiusB) <= toleransi ? 'sepusat/berimpit' : 'sepusat';
    jumlahTitikPersekutuan = 0;
    jumlahGarisSinggungPersekutuan = 0;
  } else if (samaJarak(d, jumlahRadius)) {
    kedudukan = 'bersinggungan luar';
    jumlahTitikPersekutuan = 1;
    jumlahGarisSinggungPersekutuan = 3;
  } else if (samaJarak(d, selisihRadius) && d > toleransi) {
    kedudukan = 'bersinggungan dalam';
    jumlahTitikPersekutuan = 1;
    jumlahGarisSinggungPersekutuan = 1;
  } else if (d > jumlahRadius + toleransi) {
    kedudukan = 'saling lepas';
    jumlahTitikPersekutuan = 0;
    jumlahGarisSinggungPersekutuan = 4;
  } else if (d > selisihRadius + toleransi) {
    kedudukan = 'berpotongan di dua titik';
    jumlahTitikPersekutuan = 2;
    jumlahGarisSinggungPersekutuan = 2;
  } else {
    kedudukan = 'satu di dalam yang lain';
    jumlahTitikPersekutuan = 0;
    jumlahGarisSinggungPersekutuan = 0;
  }

  const titikPersekutuan = jumlahTitikPersekutuan > 0 ? potongDuaLingkaran(a, b) : [];
  return {
    kedudukan,
    d: Number.isFinite(d) ? d : 0,
    jumlahRadius,
    selisihRadius,
    jumlahTitikPersekutuan,
    jumlahGarisSinggungPersekutuan,
    titikPersekutuan
  };
}
