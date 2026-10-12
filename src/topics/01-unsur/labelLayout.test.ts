import { describe, expect, it } from 'vitest';
import { titikDariSudut } from '../../lib/geometry';
import { hitungLayoutLabel, labelBeririsan } from './labelLayout';
import { SEMUA_UNSUR } from './unsur';

describe('penempatan label unsur', () => {
  it.each([
    ['tali busur pendek', 0, 0.12],
    ['tali busur sedang', -0.45, 2.25],
    ['hampir diameter', 0, Math.PI - 0.05],
    ['tepat diameter', 0, Math.PI]
  ])('%s tidak menghasilkan label berimpit atau NaN', (_nama, sudutA, sudutB) => {
    const pusat = { x: 350, y: 215 };
    const radius = 145;
    const hasil = hitungLayoutLabel({
      pusat,
      radius,
      titikA: titikDariSudut(pusat, radius, sudutA),
      titikB: titikDariSudut(pusat, radius, sudutB),
      awalBusur: sudutA,
      akhirBusur: sudutB,
      tampil: SEMUA_UNSUR,
      ringkas: true
    });
    expect(hasil).toHaveLength(8);
    expect(hasil.every(({ titik, target, kotak }) => [titik.x, titik.y, target.x, target.y, kotak.x, kotak.y, kotak.width, kotak.height].every(Number.isFinite))).toBe(true);
    for (let i = 0; i < hasil.length; i += 1) {
      for (let j = i + 1; j < hasil.length; j += 1) expect(labelBeririsan(hasil[i], hasil[j])).toBe(false);
    }
  });
});
