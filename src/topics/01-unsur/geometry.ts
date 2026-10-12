import { proyeksiKeSegmen, jarak, normalisasiSudut, titikDariSudut, type Point } from '../../lib/geometry';

export const TOLERANSI_TITIK_BERIMPIT = 1e-6;
export const BATAS_LABEL_TALI_PENDEK = 22;

export interface RentangBusurKecil {
  awal: number;
  akhir: number;
  panjang: number;
}

export interface GeometriUnsur {
  titikA: Point;
  titikB: Point;
  titikDiameter: Point;
  kakiApotema: Point;
  panjangTaliBusur: number;
  panjangApotema: number;
  rentangBusur: RentangBusurKecil;
  adaTaliBusur: boolean;
  apotemaNol: boolean;
  labelTaliMuatan: boolean;
}

function angkaAman(nilai: number, cadangan: number): number {
  return Number.isFinite(nilai) ? nilai : cadangan;
}

export function hitungRentangBusurKecil(sudutA: number, sudutB: number): RentangBusurKecil {
  const awalA = angkaAman(sudutA, 0);
  const awalB = angkaAman(sudutB, 0);
  const maju = normalisasiSudut(awalB - awalA);
  if (maju <= Math.PI) return { awal: awalA, akhir: awalA + maju, panjang: maju };
  const panjangKecil = Math.PI * 2 - maju;
  return { awal: awalB, akhir: awalB + panjangKecil, panjang: panjangKecil };
}

export function hitungGeometriUnsur(
  pusat: Point,
  radius: number,
  sudutA: number,
  sudutB: number
): GeometriUnsur {
  const radiusAman = Number.isFinite(radius) ? Math.max(0, radius) : 0;
  const titikA = titikDariSudut(pusat, radiusAman, angkaAman(sudutA, 0));
  const titikB = titikDariSudut(pusat, radiusAman, angkaAman(sudutB, 0));
  const panjangTaliBusur = jarak(titikA, titikB);
  const adaTaliBusur = Number.isFinite(panjangTaliBusur) && panjangTaliBusur > TOLERANSI_TITIK_BERIMPIT;
  const kakiApotema = adaTaliBusur ? proyeksiKeSegmen(pusat, titikA, titikB) : pusat;
  const panjangApotemaMentah = Number.isFinite(jarak(pusat, kakiApotema)) ? jarak(pusat, kakiApotema) : 0;
  const panjangApotema = panjangApotemaMentah <= 1e-6 ? 0 : panjangApotemaMentah;
  const rentangBusur = adaTaliBusur ? hitungRentangBusurKecil(sudutA, sudutB) : { awal: 0, akhir: 0, panjang: 0 };

  return {
    titikA,
    titikB,
    titikDiameter: { x: pusat.x * 2 - titikA.x, y: pusat.y * 2 - titikA.y },
    kakiApotema,
    panjangTaliBusur: Number.isFinite(panjangTaliBusur) ? panjangTaliBusur : 0,
    panjangApotema,
    rentangBusur,
    adaTaliBusur,
    apotemaNol: adaTaliBusur && panjangApotema <= 1e-6,
    labelTaliMuatan: adaTaliBusur && panjangTaliBusur >= BATAS_LABEL_TALI_PENDEK
  };
}

export function buatPathTembereng(geometri: GeometriUnsur, pusat: Point, radius: number): string | null {
  if (!geometri.adaTaliBusur || !Number.isFinite(radius) || radius <= 0) return null;
  const { awal, akhir, panjang } = geometri.rentangBusur;
  const largeArc = panjang > Math.PI ? 1 : 0;
  const titikAwal = titikDariSudut(pusat, radius, awal);
  const titikAkhir = titikDariSudut(pusat, radius, akhir);
  return `M ${titikAwal.x} ${titikAwal.y} A ${radius} ${radius} 0 ${largeArc} 1 ${titikAkhir.x} ${titikAkhir.y} L ${titikAwal.x} ${titikAwal.y} Z`;
}
