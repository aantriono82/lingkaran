export interface FrameScheduler<T> {
  masukkan(nilai: T): void;
  flush(): void;
  batal(): void;
}

export function buatPenjadwalFrame<T>(
  kirim: (nilai: T) => void,
  jadwalkan: (callback: () => void) => number,
  batalkan: (handle: number) => void
): FrameScheduler<T> {
  let handle: number | null = null;
  let terakhir: T | undefined;

  const kirimTerakhir = (): void => {
    if (terakhir === undefined) return;
    const nilai = terakhir;
    terakhir = undefined;
    kirim(nilai);
  };

  return {
    masukkan(nilai) {
      terakhir = nilai;
      if (handle !== null) return;
      handle = jadwalkan(() => {
        handle = null;
        kirimTerakhir();
      });
    },
    flush() {
      if (handle !== null) {
        batalkan(handle);
        handle = null;
      }
      kirimTerakhir();
    },
    batal() {
      if (handle !== null) batalkan(handle);
      handle = null;
      terakhir = undefined;
    }
  };
}
