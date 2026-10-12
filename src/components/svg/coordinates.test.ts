import { describe, expect, it } from 'vitest';
import { clientToSvgPoint } from './coordinates';

describe('konversi koordinat pointer ke SVG', () => {
  it.each([
    ['wadah lebih lebar', { a: 1, b: 0, c: 0, d: 1, e: 100, f: 0 }, 100, 50, { x: 0, y: 50 }],
    ['wadah lebih tinggi', { a: 1, b: 0, c: 0, d: 1, e: 0, f: 80 }, 50, 80, { x: 50, y: 0 }],
    ['skala dan translasi', { a: 2, b: 0, c: 0, d: 2, e: 10, f: 20 }, 110, 220, { x: 50, y: 100 }],
    ['rotasi dan skew', { a: 0, b: 2, c: -2, d: 0, e: 10, f: 20 }, -30, 120, { x: 50, y: 20 }]
  ])('%s', (_nama, matrix, clientX, clientY, expected) => {
    expect(clientToSvgPoint(matrix, clientX, clientY)).toEqual(expected);
  });

  it('mengembalikan null untuk matriks yang tidak dapat diinversi', () => {
    expect(clientToSvgPoint({ a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 }, 10, 10)).toBeNull();
  });
});
