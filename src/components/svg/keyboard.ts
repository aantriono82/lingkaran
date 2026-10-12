import type { Point } from '../../lib/geometry';

export type SvgKeyboardKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';

export function langkahTitik(titik: Point, key: SvgKeyboardKey, shift = false, langkahKecil = 4): Point | null {
  const langkah = shift ? langkahKecil * 5 : langkahKecil;
  if (key === 'ArrowUp') return { x: titik.x, y: titik.y - langkah };
  if (key === 'ArrowDown') return { x: titik.x, y: titik.y + langkah };
  if (key === 'ArrowLeft') return { x: titik.x - langkah, y: titik.y };
  if (key === 'ArrowRight') return { x: titik.x + langkah, y: titik.y };
  return null;
}

export function terapkanLangkah(titik: Point, key: SvgKeyboardKey, shift: boolean, constrain: (nilai: Point) => Point): Point | null {
  const kandidat = langkahTitik(titik, key, shift);
  return kandidat ? constrain(kandidat) : null;
}
