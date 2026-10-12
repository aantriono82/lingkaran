import { describe, expect, it } from 'vitest';
import { adalahSemuaUnsur, buatSemuaUnsur, kosongkanUnsur, SEMUA_UNSUR, toggleUnsur, type Unsur } from './unsur';

describe('himpunan unsur yang tampil', () => {
  it('Tampilkan semua menghasilkan delapan unsur', () => {
    const semua = buatSemuaUnsur();
    expect(semua.size).toBe(8);
    expect(adalahSemuaUnsur(semua)).toBe(true);
    expect([...semua]).toEqual([...SEMUA_UNSUR]);
  });

  it('Kosongkan menghasilkan nol unsur', () => {
    expect(kosongkanUnsur().size).toBe(0);
  });

  it('toggle menambah atau menghapus tepat satu unsur', () => {
    const awal = new Set<Unsur>(['jariJari', 'diameter']);
    const ditambah = toggleUnsur(awal, 'taliBusur');
    const dihapus = toggleUnsur(ditambah, 'diameter');
    expect(ditambah).toEqual(new Set(['jariJari', 'diameter', 'taliBusur']));
    expect(dihapus).toEqual(new Set(['jariJari', 'taliBusur']));
  });
});
