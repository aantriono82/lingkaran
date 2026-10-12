import { describe, expect, it } from 'vitest';

const WARNA_LAMA_TERLARANG = [
  '#277da1',
  '#d1495b',
  '#2a9d8f',
  '#7b61a8',
  '#9b7ede',
  '#f4a261',
  '#ef8354',
  '#173f6d',
  '#18324b',
  '#5f7182',
  '#e76f51',
  '#bc6c25',
  '#f7c948',
  '#e9c46a',
  '#d8e4ee',
  '#d7e8f5',
  '#8eb9d6',
  '#d8e5f0',
  '#9bb4c9'
];

describe('Audit Pemindaian Warna Hardcode & Token', () => {
  // Menggunakan Vite native import.meta.glob (?raw) agar kompatibel dengan lingkungan peramban/DOM TypeScript
  const berkasMap = import.meta.glob<string>(
    ['../*.{ts,tsx,css}', '../**/*.{ts,tsx,css}'],
    {
      query: '?raw',
      import: 'default',
      eager: true
    }
  );

  it('tidak ada warna palet lama yang tersisa di seluruh berkas src/', () => {
    const pelanggaran: Array<{ berkas: string; baris: number; warna: string }> = [];

    for (const [path, konten] of Object.entries(berkasMap)) {
      if (path.endsWith('tokens.test.ts')) continue;

      const baris = konten.split('\n');
      baris.forEach((teks: string, idx: number) => {
        for (const warna of WARNA_LAMA_TERLARANG) {
          if (teks.toLowerCase().includes(warna.toLowerCase())) {
            pelanggaran.push({ berkas: path, baris: idx + 1, warna });
          }
        }
      });
    }

    expect(
      pelanggaran,
      `Ditemukan ${pelanggaran.length} penggunaan warna lama yang dilarang:\n` +
        pelanggaran.map((p) => `${p.berkas}:${p.baris} (${p.warna})`).join('\n')
    ).toHaveLength(0);
  });

  it('berkas komponen dan topik hanya memakai token atau warna putih/netral SVG fungsional', () => {
    const regexHex = /#[0-9a-fA-F]{3,8}\b/g;
    const pengecualianSah = new Set(['#ffffff', '#fff']);

    const pelanggaranHex: Array<{ berkas: string; hex: string; baris: number }> = [];

    for (const [path, konten] of Object.entries(berkasMap)) {
      if (
        (!path.includes('/components/') && !path.includes('/topics/')) ||
        path.endsWith('.test.ts') ||
        path.endsWith('.test.tsx')
      ) {
        continue;
      }

      const baris = konten.split('\n');
      baris.forEach((teks: string, idx: number) => {
        const matches = teks.match(regexHex);
        if (matches) {
          for (const hex of matches) {
            if (!pengecualianSah.has(hex.toLowerCase())) {
              pelanggaranHex.push({ berkas: path, hex, baris: idx + 1 });
            }
          }
        }
      });
    }

    expect(
      pelanggaranHex,
      `Ditemukan hex warna di komponen/topik tanpa melalui token:\n` +
        pelanggaranHex.map((p) => `${p.berkas}:${p.baris} (${p.hex})`).join('\n')
    ).toHaveLength(0);
  });
});
