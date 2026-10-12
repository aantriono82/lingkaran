function splitCssList(value: string): string[] {
  const items: string[] = [];
  let mulai = 0;
  let kedalaman = 0;
  let kutip: '"' | "'" | null = null;

  for (let indeks = 0; indeks < value.length; indeks += 1) {
    const karakter = value[indeks];
    if (kutip) {
      if (karakter === kutip && value[indeks - 1] !== '\\') kutip = null;
      continue;
    }
    if (karakter === '"' || karakter === "'") {
      kutip = karakter;
    } else if (karakter === '(') {
      kedalaman += 1;
    } else if (karakter === ')') {
      kedalaman = Math.max(0, kedalaman - 1);
    } else if (karakter === ',' && kedalaman === 0) {
      items.push(value.slice(mulai, indeks).trim());
      mulai = indeks + 1;
    }
  }
  items.push(value.slice(mulai).trim());
  return items.filter(Boolean);
}

function memakaiFontFallback(source: string): boolean {
  const cocok = source.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
  if (!cocok) return false;
  return /\.(?:woff|ttf)(?:[?#]|$)/i.test(cocok[1]);
}

function hanyaWoff2(block: string): string {
  if (!/font-family\s*:\s*["']?KaTeX(?:["']|[\w-])/i.test(block)) return block;
  return block.replace(/(\bsrc\s*:\s*)([^;{}]+)(;?)/gi, (_semua, awalan: string, nilai: string, penutup: string) => {
    const sumber = splitCssList(nilai).filter((item) => !memakaiFontFallback(item));
    return `${awalan}${sumber.join(', ')}${penutup}`;
  });
}

/** Menyisakan woff2 pada deklarasi @font-face milik KaTeX. */
export function filterKatexFonts(css: string): string {
  return css.replace(/@font-face\s*{[^{}]*}/gi, hanyaWoff2);
}
