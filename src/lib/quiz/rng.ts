export function buatRng(seed: number): () => number {
  let nilai = (seed >>> 0) || 1;
  return () => {
    nilai = (nilai * 1664525 + 1013904223) >>> 0;
    return nilai / 4294967296;
  };
}

export function bilanganBulat(rng: () => number, minimum: number, maksimum: number): number {
  return Math.floor(rng() * (maksimum - minimum + 1)) + minimum;
}

export function ambil<T>(rng: () => number, pilihan: readonly T[]): T {
  return pilihan[Math.floor(rng() * pilihan.length)];
}
