import { describe, expect, it } from 'vitest';
import { bolehMuatUlangPembaruan } from './updatePolicy';

describe('keputusan pembaruan PWA', () => {
  it('menahan muat ulang ketika kuis berjalan', () => {
    expect(bolehMuatUlangPembaruan({ kuisBerjalan: true, pembaruanTersedia: true })).toBe(false);
  });

  it('mengizinkan pembaruan ketika tidak ada kuis', () => {
    expect(bolehMuatUlangPembaruan({ kuisBerjalan: false, pembaruanTersedia: true })).toBe(true);
    expect(bolehMuatUlangPembaruan({ kuisBerjalan: false, pembaruanTersedia: false })).toBe(false);
  });
});
