import { describe, expect, it } from 'vitest';
import { filterKatexFonts } from './katexFontTransform';

describe('filterKatexFonts', () => {
  it('menyisakan woff2 dari deklarasi font KaTeX', () => {
    const css = `@font-face { font-family: KaTeX_Main; src: url("main.woff2") format("woff2"), url(main.woff) format("woff"), url(main.ttf) format("truetype"); }`;
    const hasil = filterKatexFonts(css);
    expect(hasil).toContain('main.woff2');
    expect(hasil).not.toContain('main.woff)');
    expect(hasil).not.toContain('main.ttf');
  });

  it('tidak mengubah CSS tanpa deklarasi font', () => {
    const css = '.diagram { background: url("gambar.woff"); }';
    expect(filterKatexFonts(css)).toBe(css);
  });

  it('tidak menghapus font fallback pada keluarga selain KaTeX atau format lain', () => {
    const css = `@font-face { font-family: App; src: url(app.woff) format("woff"), url(app.otf) format("opentype"); }\n@font-face { font-family: KaTeX_Main; src: url(main.woff2) format("woff2"), url(main.otf) format("opentype"); }`;
    const hasil = filterKatexFonts(css);
    expect(hasil).toContain('app.woff');
    expect(hasil).toContain('main.otf');
    expect(hasil).toContain('main.woff2');
  });
});
