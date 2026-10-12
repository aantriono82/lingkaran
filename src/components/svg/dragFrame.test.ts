import { describe, expect, it } from 'vitest';
import { buatPenjadwalFrame } from './dragFrame';

describe('penjadwal pembaruan drag', () => {
  it('hanya mengirim nilai terakhir dalam satu frame', () => {
    const callbacks: Array<() => void> = [];
    const hasil: number[] = [];
    const jadwal = buatPenjadwalFrame((nilai: number) => hasil.push(nilai), (callback) => {
      callbacks.push(callback);
      return callbacks.length;
    }, () => undefined);
    jadwal.masukkan(1);
    jadwal.masukkan(2);
    jadwal.masukkan(3);
    expect(hasil).toEqual([]);
    callbacks[0]();
    expect(hasil).toEqual([3]);
  });

  it('flush mengirim titik akhir drag', () => {
    const callbacks: Array<() => void> = [];
    const hasil: number[] = [];
    const jadwal = buatPenjadwalFrame((nilai: number) => hasil.push(nilai), (callback) => {
      callbacks.push(callback);
      return callbacks.length;
    }, () => undefined);
    jadwal.masukkan(4);
    jadwal.masukkan(5);
    jadwal.flush();
    expect(hasil).toEqual([5]);
    callbacks[0]?.();
    expect(hasil).toEqual([5]);
  });
});
