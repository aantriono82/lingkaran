export interface BatasArchimedes {
  n: number;
  bawah: number;
  atas: number;
  selisih: number;
}

export const N_ARCHIMEDES = [6, 8, 12, 16, 24, 32, 48, 64, 96] as const;

function normalisasiN(n: number): number {
  if (!Number.isFinite(n)) return 6;
  return Math.min(96, Math.max(3, Math.round(n)));
}

/**
 * Jalur pintas untuk n bebas. π dipakai hanya untuk memilih panjang sisi
 * melalui trigonometri; jalur utama cerita Archimedes memakai rekurrensi.
 */
export function hitungBatasTrigonometri(n: number): BatasArchimedes {
  const jumlahSisi = normalisasiN(n);
  const bawah = jumlahSisi * Math.sin(Math.PI / jumlahSisi);
  const atas = jumlahSisi * Math.tan(Math.PI / jumlahSisi);
  return { n: jumlahSisi, bawah, atas, selisih: atas - bawah };
}

export function hitungBatasRekurrensi(n: number): BatasArchimedes {
  const jumlahSisi = normalisasiN(n);
  if (![6, 12, 24, 48, 96].includes(jumlahSisi)) {
    return hitungBatasTrigonometri(jumlahSisi);
  }

  let bawah = 3;
  let atas = 2 * Math.sqrt(3);
  let sisi = 6;
  while (sisi < jumlahSisi) {
    const atasBerikutnya = (2 * atas * bawah) / (atas + bawah);
    const bawahBerikutnya = Math.sqrt(atasBerikutnya * bawah);
    atas = atasBerikutnya;
    bawah = bawahBerikutnya;
    sisi *= 2;
  }
  return { n: jumlahSisi, bawah, atas, selisih: atas - bawah };
}

/** Hitung batas dengan rekurrensi bila n mengikuti urutan pelipatan sisi. */
export function hitungBatasArchimedes(n: number): BatasArchimedes {
  return hitungBatasRekurrensi(n);
}

export const hitungBatas = hitungBatasArchimedes;
