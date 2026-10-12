import type { Point } from '../../lib/geometry';
import { titikDariSudut } from '../../lib/geometry';
import { SEMUA_UNSUR, UNSUR_INFO, type Unsur } from './unsur';

export interface KotakLabel {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PenempatanLabel {
  id: Unsur;
  titik: Point;
  target: Point;
  kotak: KotakLabel;
  badge: boolean;
}

export interface LabelLayoutInput {
  pusat: Point;
  radius: number;
  titikA: Point;
  titikB: Point;
  awalBusur: number;
  akhirBusur: number;
  tampil: readonly Unsur[];
  ringkas?: boolean;
}

const LEBAR_KANVAS = 700;
const TINGGI_KANVAS = 430;
const JARAK_LABEL = 5;

function angkaAman(nilai: number, cadangan: number): number {
  return Number.isFinite(nilai) ? nilai : cadangan;
}

function titikAman(titik: Point, cadangan: Point): Point {
  return Number.isFinite(titik.x) && Number.isFinite(titik.y) ? titik : cadangan;
}

function unit(vektor: Point, cadangan: Point = { x: 0, y: -1 }): Point {
  const panjang = Math.hypot(vektor.x, vektor.y);
  if (!Number.isFinite(panjang) || panjang < 1e-9) return cadangan;
  return { x: vektor.x / panjang, y: vektor.y / panjang };
}

function tambah(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function kali(a: Point, skalar: number): Point {
  return { x: a.x * skalar, y: a.y * skalar };
}

function clampPoint(titik: Point, width: number, height: number): Point {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return {
    x: Math.min(LEBAR_KANVAS - halfWidth - 8, Math.max(halfWidth + 8, angkaAman(titik.x, LEBAR_KANVAS / 2))),
    y: Math.min(TINGGI_KANVAS - halfHeight - 8, Math.max(halfHeight + 8, angkaAman(titik.y, TINGGI_KANVAS / 2)))
  };
}

function buatKotak(titik: Point, width: number, height: number): KotakLabel {
  return { x: titik.x - width / 2, y: titik.y - height / 2, width, height };
}

function beririsan(a: KotakLabel, b: KotakLabel): boolean {
  return a.x < b.x + b.width + JARAK_LABEL
    && a.x + a.width + JARAK_LABEL > b.x
    && a.y < b.y + b.height + JARAK_LABEL
    && a.y + a.height + JARAK_LABEL > b.y;
}

function arahTegak(arah: Point): Point {
  return { x: -arah.y, y: arah.x };
}

function titikPilihan(preferred: Point, radial: Point, tangent: Point): Point[] {
  const radialAman = unit(radial);
  const tangentAman = unit(tangent, arahTegak(radialAman));
  const arah = [
    radialAman,
    tangentAman,
    kali(radialAman, -1),
    kali(tangentAman, -1),
    unit(tambah(radialAman, tangentAman)),
    unit(tambah(kali(radialAman, -1), tangentAman)),
    { x: 0, y: -1 },
    { x: 0, y: 1 }
  ];
  const jarak = [0, 20, 38, 56];
  return jarak.flatMap((nilai) => arah.map((vektor) => tambah(preferred, kali(vektor, nilai))));
}

function titikPilihanGlobal(indeks: number, jumlah: number, pusat: Point, radius: number): Point[] {
  const sudut = -Math.PI / 2 + (indeks / Math.max(1, jumlah)) * Math.PI * 2;
  return [
    titikDariSudut(pusat, Math.max(100, radius) + 48, sudut),
    titikDariSudut(pusat, Math.max(100, radius) + 72, sudut)
  ];
}

function pilihanUntukUnsur(id: Unsur, input: LabelLayoutInput): { preferred: Point; target: Point; radial: Point; tangent: Point } {
  const { pusat, radius, titikA, titikB, awalBusur, akhirBusur } = input;
  const arahA = unit({ x: titikA.x - pusat.x, y: titikA.y - pusat.y });
  const sudutTengah = (awalBusur + akhirBusur) / 2;
  const arahTengah = { x: Math.cos(sudutTengah), y: Math.sin(sudutTengah) };
  const arahTali = unit({ x: titikB.x - titikA.x, y: titikB.y - titikA.y }, arahTegak(arahTengah));
  const arahDiameter = arahA;
  const tengahTali = { x: (titikA.x + titikB.x) / 2, y: (titikA.y + titikB.y) / 2 };
  const titikBusur = titikDariSudut(pusat, radius + 20, sudutTengah);
  const targetBusur = titikDariSudut(pusat, radius, sudutTengah);

  switch (id) {
    case 'pusat':
      return { preferred: tambah(pusat, { x: 0, y: -24 }), target: pusat, radial: { x: 0, y: -1 }, tangent: { x: 1, y: 0 } };
    case 'jariJari': {
      const target = titikDariSudut(pusat, radius * 0.52, sudutArahArah(arahA));
      return { preferred: tambah(target, kali(arahTegak(arahA), 18)), target, radial: arahTegak(arahA), tangent: arahA };
    }
    case 'diameter':
      return { preferred: tambah(pusat, kali(arahTegak(arahDiameter), 25)), target: pusat, radial: arahTegak(arahDiameter), tangent: arahDiameter };
    case 'taliBusur':
      return { preferred: tambah(tengahTali, kali(arahTegak(arahTali), 18)), target: tengahTali, radial: arahTegak(arahTali), tangent: arahTali };
    case 'busur':
      return { preferred: titikBusur, target: targetBusur, radial: arahTengah, tangent: arahTegak(arahTengah) };
    case 'juring': {
      const target = titikDariSudut(pusat, Math.max(30, radius * 0.52), sudutTengah);
      return { preferred: target, target, radial: arahTengah, tangent: arahTegak(arahTengah) };
    }
    case 'tembereng': {
      const target = titikDariSudut(pusat, Math.max(45, radius * 0.82), sudutTengah);
      return { preferred: target, target, radial: arahTengah, tangent: arahTegak(arahTengah) };
    }
    case 'apotema': {
      const target = { x: (pusat.x + tengahTali.x) / 2, y: (pusat.y + tengahTali.y) / 2 };
      return { preferred: tambah(target, kali(arahTegak(arahTali), 15)), target, radial: arahTegak(arahTali), tangent: arahTali };
    }
  }
}

function sudutArahArah(arah: Point): number {
  return Math.atan2(arah.y, arah.x);
}

export function hitungLayoutLabel(input: LabelLayoutInput): PenempatanLabel[] {
  const ids = SEMUA_UNSUR.filter((id) => input.tampil.includes(id));
  const ringkas = input.ringkas ?? ids.length >= 4;
  const hasil: PenempatanLabel[] = [];

  ids.forEach((id, indeks) => {
    const info = UNSUR_INFO[id];
    const badge = ringkas;
    const width = badge ? 24 : Math.max(28, info.label.length * 8 + 12);
    const height = badge ? 24 : 24;
    const pilihan = pilihanUntukUnsur(id, input);
    const kandidat = ringkas
      ? titikPilihanGlobal(indeks, ids.length, input.pusat, angkaAman(input.radius, 120))
      : [
        ...titikPilihan(pilihan.preferred, pilihan.radial, pilihan.tangent),
        ...titikPilihanGlobal(indeks, ids.length, input.pusat, angkaAman(input.radius, 120))
      ];
    let terpilih: Point | null = null;
    let skorTerbaik = Number.POSITIVE_INFINITY;
    for (const kandidatMentah of kandidat) {
      const titik = clampPoint(titikAman(kandidatMentah, input.pusat), width, height);
      const kotak = buatKotak(titik, width, height);
      const tabrakan = hasil.reduce((jumlah, item) => jumlah + (beririsan(kotak, item.kotak) ? 1 : 0), 0);
      if (tabrakan === 0) {
        terpilih = titik;
        break;
      }
      if (tabrakan < skorTerbaik) {
        skorTerbaik = tabrakan;
        terpilih = titik;
      }
    }
    const titik = terpilih ?? input.pusat;
    hasil.push({ id, titik, target: titikAman(pilihan.target, input.pusat), kotak: buatKotak(titik, width, height), badge });
  });

  return hasil;
}

export function labelBeririsan(a: PenempatanLabel, b: PenempatanLabel): boolean {
  return beririsan(a.kotak, b.kotak);
}
