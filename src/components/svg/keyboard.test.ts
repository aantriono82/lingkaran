import { describe, expect, it } from 'vitest';
import { langkahTitik, terapkanLangkah } from './keyboard';

describe('langkah keyboard titik SVG', () => {
  it('menggunakan langkah besar dengan Shift', () => {
    expect(langkahTitik({ x: 10, y: 10 }, 'ArrowRight', false)).toEqual({ x: 14, y: 10 });
    expect(langkahTitik({ x: 10, y: 10 }, 'ArrowRight', true)).toEqual({ x: 30, y: 10 });
  });

  it('menerapkan batas sehingga titik bebas tidak keluar bidang', () => {
    const hasil = terapkanLangkah({ x: 2, y: 2 }, 'ArrowLeft', false, (point) => ({
      x: Math.max(0, point.x),
      y: Math.max(0, point.y)
    }));
    expect(hasil).toEqual({ x: 0, y: 2 });
  });
});
