const baseUrl = new URL(process.argv[2] ?? 'http://localhost:4173/');

async function ambil(url) {
  const hasil = await fetch(url);
  if (!hasil.ok) throw new Error(`${hasil.status} ${url}`);
  return hasil;
}

const halamanUrl = new URL('./', baseUrl);
const halaman = await (await ambil(halamanUrl)).text();
const cssPaths = [...halaman.matchAll(/<link[^>]+href=["']([^"']+\.css(?:\?[^"']*)?)["']/gi)].map((cocok) => cocok[1]);
if (cssPaths.length === 0) throw new Error('Tidak menemukan stylesheet pada index.html');

let jumlahFont = 0;
for (const cssPath of cssPaths) {
  const cssUrl = new URL(cssPath, halamanUrl);
  if (cssUrl.origin !== baseUrl.origin) throw new Error(`Stylesheet eksternal: ${cssUrl}`);
  const css = await (await ambil(cssUrl)).text();
  const fontPaths = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)]
    .map((cocok) => cocok[1])
    .filter((path) => /\.(?:woff2|woff|ttf)(?:[?#]|$)/i.test(path));
  for (const fontPath of fontPaths) {
    const fontUrl = new URL(fontPath, cssUrl);
    if (fontUrl.origin !== baseUrl.origin) throw new Error(`Font eksternal: ${fontUrl}`);
    await ambil(fontUrl);
    jumlahFont += 1;
  }
}

for (const path of ['./manifest.webmanifest', './sw.js']) await ambil(new URL(path, halamanUrl));
console.log(`Pemeriksaan preview lulus: halaman, ${cssPaths.length} CSS, ${jumlahFont} font, manifest, dan service worker HTTP 200.`);
