import type { Point } from '../../lib/geometry';

export interface ScreenMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

/** Mengubah koordinat layar ke koordinat viewBox dengan inversi CTM SVG. */
export function clientToSvgPoint(matrix: ScreenMatrix, clientX: number, clientY: number): Point | null {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) return null;
  const x = clientX - matrix.e;
  const y = clientY - matrix.f;
  const point = {
    x: (matrix.d * x - matrix.c * y) / determinant,
    y: (-matrix.b * x + matrix.a * y) / determinant
  };
  return Number.isFinite(point.x) && Number.isFinite(point.y) ? point : null;
}

export function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number): Point | null {
  const matrix = svg.getScreenCTM();
  return matrix ? clientToSvgPoint(matrix, clientX, clientY) : null;
}
