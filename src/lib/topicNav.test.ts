import { describe, expect, it } from 'vitest';
import { formatEyebrowTopik, tentukanNavigasiTopik } from './topicNav';
import { topicRegistry } from '../topics/registry';

describe('topicNav', () => {
  it('formatEyebrowTopik menyusun label rumpun dan nomor dengan benar', () => {
    const topik7 = topicRegistry.find((t) => t.id === '07-dalam-segitiga')!;
    expect(topik7).toBeDefined();
    expect(formatEyebrowTopik(topik7)).toBe('Rumpun III · Topik 07 dari 10');

    const topik1 = topicRegistry.find((t) => t.id === '01-unsur')!;
    expect(formatEyebrowTopik(topik1)).toBe('Rumpun I · Topik 01 dari 10');
  });

  it('tentukanNavigasiTopik menonaktifkan "sebelumnya" pada topik pertama (Topik 01)', () => {
    const nav = tentukanNavigasiTopik('01-unsur');
    expect(nav.sebelumnya.ada).toBe(false);
    expect(nav.sebelumnya.topik).toBeUndefined();
    expect(nav.sebelumnya.label).toBe('← Topik sebelumnya');

    expect(nav.berikutnya.ada).toBe(true);
    expect(nav.berikutnya.topik?.id).toBe('02-keliling');
    expect(nav.berikutnya.label).toBe('Topik 02 →');
  });

  it('tentukanNavigasiTopik menonaktifkan "berikutnya" pada topik terakhir (Topik 10)', () => {
    const nav = tentukanNavigasiTopik('10-kedudukan');
    expect(nav.sebelumnya.ada).toBe(true);
    expect(nav.sebelumnya.topik?.id).toBe('09-garis-singgung');
    expect(nav.sebelumnya.label).toBe('← Topik 09');

    expect(nav.berikutnya.ada).toBe(false);
    expect(nav.berikutnya.topik).toBeUndefined();
    expect(nav.berikutnya.label).toBe('Topik berikutnya →');
  });

  it('tentukanNavigasiTopik mengaktifkan kedua tombol pada topik tengah (Topik 07)', () => {
    const nav = tentukanNavigasiTopik('07-dalam-segitiga');
    expect(nav.sebelumnya.ada).toBe(true);
    expect(nav.sebelumnya.topik?.id).toBe('06-segi-empat');
    expect(nav.sebelumnya.label).toBe('← Topik 06');

    expect(nav.berikutnya.ada).toBe(true);
    expect(nav.berikutnya.topik?.id).toBe('08-luar-segitiga');
    expect(nav.berikutnya.label).toBe('Topik 08 →');
  });
});
