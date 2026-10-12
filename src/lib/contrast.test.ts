import { describe, expect, it } from 'vitest';
import { hitungKontras } from './contrast';
import { WARNA_GEOMETRI, WARNA_GEOMETRI_GELAP, WARNA_TEMA, WARNA_TEMA_GELAP } from './tokens';

describe('Uji Kontras WCAG 2.1 untuk Token Desain Arah B', () => {
  it('teks utama memenuhi standar WCAG AAA (>= 7:1) terhadap latar putih dan latar aplikasi', () => {
    const kontrasPutih = hitungKontras(WARNA_TEMA.teks, WARNA_TEMA.permukaan);
    const kontrasLatar = hitungKontras(WARNA_TEMA.teks, WARNA_TEMA.latar);

    // Standar AA minimal 4.5:1, target IFP 7:1 (AAA)
    expect(kontrasPutih).toBeGreaterThanOrEqual(7.0);
    expect(kontrasLatar).toBeGreaterThanOrEqual(7.0);
  });

  it('teks lembut memenuhi standar WCAG AA (>= 4.5:1) dan target keterbacaan kelas (>= 6.5:1)', () => {
    const kontrasPutih = hitungKontras(WARNA_TEMA.teksLembut, WARNA_TEMA.permukaan);
    const kontrasLatar = hitungKontras(WARNA_TEMA.teksLembut, WARNA_TEMA.latar);

    expect(kontrasPutih).toBeGreaterThanOrEqual(4.5);
    expect(kontrasLatar).toBeGreaterThanOrEqual(4.5);
  });

  it('warna tombol primer dan tombol destruktif memenuhi standar WCAG AA (>= 4.5:1) terhadap teks putih', () => {
    const kontrasUtama = hitungKontras(WARNA_TEMA.utama, '#ffffff');
    const kontrasDestruktif = hitungKontras(WARNA_TEMA.destruktif, '#ffffff');

    expect(kontrasUtama).toBeGreaterThanOrEqual(4.5);
    expect(kontrasDestruktif).toBeGreaterThanOrEqual(4.5);
  });

  it('seluruh warna geometri utama memenuhi standar WCAG Non-text Contrast (>= 3:1) terhadap kanvas', () => {
    const latarKanvas = [WARNA_TEMA.permukaan, WARNA_TEMA.permukaanRedup];

    const warnaGeometriDiuji: Array<{ nama: string; hex: string }> = [
      { nama: 'radius', hex: WARNA_GEOMETRI.radius },
      { nama: 'diameter', hex: WARNA_GEOMETRI.diameter },
      { nama: 'taliBusur', hex: WARNA_GEOMETRI.taliBusur },
      { nama: 'busur', hex: WARNA_GEOMETRI.busur },
      { nama: 'juring', hex: WARNA_GEOMETRI.juring },
      { nama: 'tembereng', hex: WARNA_GEOMETRI.tembereng },
      { nama: 'apotema', hex: WARNA_GEOMETRI.apotema },
      { nama: 'titikPusat', hex: WARNA_GEOMETRI.titikPusat }
    ];

    for (const canvas of latarKanvas) {
      for (const { nama, hex } of warnaGeometriDiuji) {
        const kontras = hitungKontras(hex, canvas);
        expect(kontras, `Kontras ${nama} (${hex}) terhadap kanvas (${canvas}) harus >= 3.0:1`).toBeGreaterThanOrEqual(3.0);
      }
    }
  });

  it('tema gelap: teks utama dan teks lembut memenuhi standar WCAG AAA/AA terhadap latar gelap', () => {
    const kontrasPermukaan = hitungKontras(WARNA_TEMA_GELAP.teks, WARNA_TEMA_GELAP.permukaan);
    const kontrasLatar = hitungKontras(WARNA_TEMA_GELAP.teks, WARNA_TEMA_GELAP.latar);

    expect(kontrasPermukaan).toBeGreaterThanOrEqual(7.0);
    expect(kontrasLatar).toBeGreaterThanOrEqual(7.0);

    const kontrasLembutPermukaan = hitungKontras(WARNA_TEMA_GELAP.teksLembut, WARNA_TEMA_GELAP.permukaan);
    const kontrasLembutLatar = hitungKontras(WARNA_TEMA_GELAP.teksLembut, WARNA_TEMA_GELAP.latar);

    expect(kontrasLembutPermukaan).toBeGreaterThanOrEqual(4.5);
    expect(kontrasLembutLatar).toBeGreaterThanOrEqual(4.5);
  });

  it('tema gelap: seluruh warna geometri gelap memenuhi standar WCAG Non-text Contrast (>= 3:1) terhadap kanvas gelap', () => {
    const latarKanvasGelap = [WARNA_TEMA_GELAP.permukaan, WARNA_TEMA_GELAP.permukaanRedup];

    const warnaGeometriGelapDiuji: Array<{ nama: string; hex: string }> = [
      { nama: 'radius', hex: WARNA_GEOMETRI_GELAP.radius },
      { nama: 'diameter', hex: WARNA_GEOMETRI_GELAP.diameter },
      { nama: 'taliBusur', hex: WARNA_GEOMETRI_GELAP.taliBusur },
      { nama: 'busur', hex: WARNA_GEOMETRI_GELAP.busur },
      { nama: 'juring', hex: WARNA_GEOMETRI_GELAP.juring },
      { nama: 'tembereng', hex: WARNA_GEOMETRI_GELAP.tembereng },
      { nama: 'apotema', hex: WARNA_GEOMETRI_GELAP.apotema },
      { nama: 'titikPusat', hex: WARNA_GEOMETRI_GELAP.titikPusat }
    ];

    for (const canvas of latarKanvasGelap) {
      for (const { nama, hex } of warnaGeometriGelapDiuji) {
        const kontras = hitungKontras(hex, canvas);
        expect(kontras, `Kontras gelap ${nama} (${hex}) terhadap kanvas (${canvas}) harus >= 3.0:1`).toBeGreaterThanOrEqual(3.0);
      }
    }
  });
});
