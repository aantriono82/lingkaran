import { describe, expect, it } from 'vitest';
import {
  jarak,
  klasifikasiDuaLingkaran,
  luasSegitiga,
  pusatDalamSegitiga,
  pusatLuarSegitiga,
  potongDuaLingkaran,
  potongLingkaranGaris,
  garisSinggungDariTitikLuar,
  garisSinggungPersekutuan,
  panjangGarisSinggung,
  analisisKedudukanDuaLingkaran,
  sudutDiTitik,
  titikPadaLingkaran,
  analisisDuaTaliBusur,
  besarBusurKecil,
  urutkanTitikLingkaran,
  analisisSegiEmpatTaliBusur,
  segiEmpatSederhana,
  analisisSegitiga,
  garisSumbuSisi,
  segitigaHampirDegenerat
} from './index';

describe('geometri dasar lingkaran', () => {
  it('menghitung jarak dan titik dari sudut', () => {
    const titik = titikPadaLingkaran({ pusat: { x: 2, y: 3 }, jariJari: 5 }, Math.PI / 2);
    expect(titik.x).toBeCloseTo(2);
    expect(titik.y).toBeCloseTo(8);
    expect(jarak({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('menemukan potongan garis dengan lingkaran', () => {
    const hasil = potongLingkaranGaris({ pusat: { x: 0, y: 0 }, jariJari: 5 }, { x: -10, y: 0 }, { x: 10, y: 0 });
    expect(hasil).toHaveLength(2);
    expect(hasil[0].x).toBeCloseTo(-5);
    expect(hasil[1].x).toBeCloseTo(5);
  });

  it('menemukan dua titik potong lingkaran', () => {
    const hasil = potongDuaLingkaran({ pusat: { x: 0, y: 0 }, jariJari: 5 }, { pusat: { x: 6, y: 0 }, jariJari: 5 });
    expect(hasil).toHaveLength(2);
    expect(hasil[0].x).toBeCloseTo(3);
    expect(Math.abs(hasil[0].y)).toBeCloseTo(4);
  });

  it('mengklasifikasikan dua lingkaran', () => {
    expect(klasifikasiDuaLingkaran({ pusat: { x: 0, y: 0 }, jariJari: 3 }, { pusat: { x: 10, y: 0 }, jariJari: 3 })).toBe('saling lepas');
    expect(klasifikasiDuaLingkaran({ pusat: { x: 0, y: 0 }, jariJari: 3 }, { pusat: { x: 6, y: 0 }, jariJari: 3 })).toBe('bersinggungan luar');
  });

  it('menghitung dua titik singgung dari titik luar', () => {
    const lingkaran = { pusat: { x: 0, y: 0 }, jariJari: 3 };
    const titikLuar = { x: 5, y: 0 };
    const hasil = garisSinggungDariTitikLuar(lingkaran, titikLuar);
    expect(hasil).toHaveLength(2);
    expect(hasil[0].x).toBeCloseTo(1.8);
    expect(Math.abs(hasil[0].y)).toBeCloseTo(2.4);
    expect(panjangGarisSinggung(lingkaran, titikLuar)).toBeCloseTo(4);
  });

  it('tetap stabil saat titik luar sangat dekat dengan lingkaran', () => {
    const lingkaran = { pusat: { x: 0, y: 0 }, jariJari: 5 };
    for (const titik of [{ x: 5, y: 0 }, { x: 5 + 1e-10, y: 0 }, { x: 5 + 1e-6, y: 0 }]) {
      const hasil = garisSinggungDariTitikLuar(lingkaran, titik);
      expect(hasil.length).toBeGreaterThanOrEqual(1);
      expect(hasil.flatMap((item) => [item.x, item.y]).every(Number.isFinite)).toBe(true);
    }
    expect(garisSinggungDariTitikLuar(lingkaran, { x: 4.99, y: 0 })).toEqual([]);
  });

  it('menghitung garis singgung persekutuan luar dan dalam', () => {
    const a = { pusat: { x: 0, y: 0 }, jariJari: 3 };
    const b = { pusat: { x: 10, y: 0 }, jariJari: 3 };
    const luar = garisSinggungPersekutuan(a, b, 'luar');
    const dalam = garisSinggungPersekutuan(a, b, 'dalam');
    expect(luar).toHaveLength(2);
    expect(dalam).toHaveLength(2);
    expect(luar.every((garis) => [garis.panjang, garis.titikA.x, garis.titikA.y, garis.titikB.x, garis.titikB.y].every(Number.isFinite))).toBe(true);
    expect(luar[0].panjang).toBeCloseTo(10);
    expect(dalam[0].panjang).toBeCloseTo(8);
    expect(garisSinggungPersekutuan({ pusat: { x: 0, y: 0 }, jariJari: 3 }, { pusat: { x: 2, y: 0 }, jariJari: 1 }, 'luar')).toHaveLength(0);
    expect(garisSinggungPersekutuan(a, { pusat: { x: 6, y: 0 }, jariJari: 3 }, 'dalam')).toHaveLength(0);
  });

  it('menganalisis kedudukan dua lingkaran pada semua batas', () => {
    const lingkaran = (x: number, radius: number) => ({ pusat: { x, y: 0 }, jariJari: radius });
    expect(analisisKedudukanDuaLingkaran(lingkaran(8, 3), lingkaran(0, 3))).toMatchObject({ kedudukan: 'saling lepas', jumlahGarisSinggungPersekutuan: 4, jumlahTitikPersekutuan: 0 });
    expect(analisisKedudukanDuaLingkaran(lingkaran(6, 3), lingkaran(0, 3))).toMatchObject({ kedudukan: 'bersinggungan luar', jumlahGarisSinggungPersekutuan: 3, jumlahTitikPersekutuan: 1 });
    expect(analisisKedudukanDuaLingkaran(lingkaran(4, 3), lingkaran(0, 3))).toMatchObject({ kedudukan: 'berpotongan di dua titik', jumlahGarisSinggungPersekutuan: 2, jumlahTitikPersekutuan: 2 });
    expect(analisisKedudukanDuaLingkaran(lingkaran(2, 3), lingkaran(0, 1))).toMatchObject({ kedudukan: 'bersinggungan dalam', jumlahGarisSinggungPersekutuan: 1, jumlahTitikPersekutuan: 1 });
    expect(analisisKedudukanDuaLingkaran(lingkaran(1, 3), lingkaran(0, 1))).toMatchObject({ kedudukan: 'satu di dalam yang lain', jumlahGarisSinggungPersekutuan: 0, jumlahTitikPersekutuan: 0 });
    expect(analisisKedudukanDuaLingkaran(lingkaran(0, 2), lingkaran(0, 3))).toMatchObject({ kedudukan: 'sepusat', jumlahGarisSinggungPersekutuan: 0 });
    expect(analisisKedudukanDuaLingkaran(lingkaran(0, 3), lingkaran(0, 3))).toMatchObject({ kedudukan: 'sepusat/berimpit', jumlahGarisSinggungPersekutuan: 0 });
  });

  it('tidak menghasilkan NaN saat radius minimum dan pusat berimpit', () => {
    const hasil = analisisKedudukanDuaLingkaran(
      { pusat: { x: 0, y: 0 }, jariJari: 0 },
      { pusat: { x: 0, y: 0 }, jariJari: 0 }
    );
    expect([hasil.d, hasil.jumlahRadius, hasil.selisihRadius].every(Number.isFinite)).toBe(true);
    expect(garisSinggungPersekutuan(
      { pusat: { x: 0, y: 0 }, jariJari: 0 },
      { pusat: { x: 0, y: 0 }, jariJari: 0 },
      'luar'
    )).toEqual([]);
  });
});

describe('geometri segitiga dan sudut', () => {
  it('menghitung luas dan pusat dalam segitiga siku-siku', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 4, y: 0 };
    const c = { x: 0, y: 3 };
    expect(luasSegitiga(a, b, c)).toBe(6);
    const pusat = pusatDalamSegitiga(a, b, c);
    expect(pusat.x).toBeCloseTo(1);
    expect(pusat.y).toBeCloseTo(1);
  });

  it('menghitung pusat luar dan sudut', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 4, y: 0 };
    const c = { x: 0, y: 3 };
    const pusat = pusatLuarSegitiga(a, b, c);
    expect(pusat.x).toBeCloseTo(2);
    expect(pusat.y).toBeCloseTo(1.5);
    expect(sudutDiTitik(a, b, c) * 180 / Math.PI).toBeCloseTo(90);
  });
});

describe('geometri dua tali busur', () => {
  const pusat = { x: 0, y: 0 };
  const titik = (sudut: number) => titikPadaLingkaran({ pusat, jariJari: 10 }, sudut);

  it('menggunakan jumlah busur untuk potongan di dalam', () => {
    const hasil = analisisDuaTaliBusur([titik(0), titik(Math.PI), titik(Math.PI / 2), titik(3 * Math.PI / 2)], pusat, 10);
    expect(hasil.diDalam).toBe(true);
    expect(hasil.sudut * 180 / Math.PI).toBeCloseTo(90);
    expect((hasil.busurPertama + hasil.busurKedua) / 2 * 180 / Math.PI).toBeCloseTo(90);
  });

  it('menggunakan selisih busur untuk potongan di luar', () => {
    const hasil = analisisDuaTaliBusur([titik(0.2), titik(0.9), titik(2.2), titik(3.0)], pusat, 10);
    expect(hasil.diDalam).toBe(false);
    expect(hasil.sudut).toBeGreaterThan(0);
    expect(Math.abs(hasil.busurPertama - hasil.busurKedua) / 2).toBeCloseTo(hasil.sudut);
  });

  it('mengurutkan titik berdasarkan sudut tanpa bergantung pada urutan input', () => {
    const hasil = urutkanTitikLingkaran([titik(5.8), titik(0.1), titik(3.2), titik(1.4)], pusat);
    expect(hasil.map((item) => item.indeks)).toEqual([1, 3, 2, 0]);
    expect(besarBusurKecil(0, 3 * Math.PI / 2)).toBeCloseTo(Math.PI / 2);
  });

  it('tetap mengurutkan ulang saat titik melewati titik lain', () => {
    const sebelum = urutkanTitikLingkaran([titik(0.2), titik(1.2), titik(2.4), titik(4.8)], pusat);
    const sesudah = urutkanTitikLingkaran([titik(1.4), titik(1.2), titik(2.4), titik(4.8)], pusat);
    expect(sebelum.map((item) => item.sudut)).toEqual([...sebelum.map((item) => item.sudut)].sort((a, b) => a - b));
    expect(sesudah.map((item) => item.sudut)).toEqual([...sesudah.map((item) => item.sudut)].sort((a, b) => a - b));
    expect(sesudah.find((item) => item.indeks === 0)?.sudut).toBeGreaterThan(1.2);
  });

  it('mengembalikan keadaan aman untuk tali busur hampir sejajar atau bertumpuk', () => {
    const hampirSejajar = analisisDuaTaliBusur([
      { x: 0, y: 0 }, { x: 100, y: 0 },
      { x: 0, y: 1e-10 }, { x: 100, y: 1.1e-10 }
    ], pusat, 100);
    const bertumpuk = analisisDuaTaliBusur([
      { x: 10, y: 10 }, { x: 10, y: 10 },
      { x: 10, y: 10 }, { x: 10, y: 10 }
    ], pusat, 100);
    for (const hasil of [hampirSejajar, bertumpuk]) {
      expect(hasil.potong).toBeNull();
      expect([hasil.sudut, hasil.busurPertama, hasil.busurKedua].every(Number.isFinite)).toBe(true);
    }
  });

  it('tetap finite saat radius sangat kecil atau sangat besar', () => {
    const kecil = analisisDuaTaliBusur([titik(0), titik(Math.PI), titik(Math.PI / 2), titik(3 * Math.PI / 2)], pusat, 1e-12);
    const besar = analisisDuaTaliBusur([
      { x: -10, y: 0 }, { x: 10, y: 0 }, { x: 0, y: -10 }, { x: 0, y: 10 }
    ], pusat, 1e12);
    expect(kecil.potong).toBeNull();
    expect([kecil.sudut, kecil.busurPertama, kecil.busurKedua].every(Number.isFinite)).toBe(true);
    expect(besar.potong).not.toBeNull();
    expect([besar.sudut, besar.busurPertama, besar.busurKedua].every(Number.isFinite)).toBe(true);
  });
});

describe('geometri segi empat dan segitiga baru', () => {
  it('mengenali segi empat tali busur dan jumlah sudut berhadapan', () => {
    const titik = [
      { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }, { x: 0, y: 3 }
    ];
    const hasil = analisisSegiEmpatTaliBusur(titik);
    expect(hasil.sederhana).toBe(true);
    expect(hasil.siklik).toBe(true);
    expect(hasil.jumlahBerhadapan[0] * 180 / Math.PI).toBeCloseTo(180);
    expect(hasil.jumlahBerhadapan[1] * 180 / Math.PI).toBeCloseTo(180);
  });

  it('menolak segi empat yang sisi berhadapannya saling memotong', () => {
    expect(segiEmpatSederhana([
      { x: 0, y: 0 }, { x: 4, y: 3 }, { x: 0, y: 3 }, { x: 4, y: 0 }
    ])).toBe(false);
    expect(analisisSegiEmpatTaliBusur([
      { x: 0, y: 0 }, { x: 4, y: 3 }, { x: 0, y: 3 }, { x: 4, y: 0 }
    ]).sudut).toEqual([]);
  });

  it('menandai segitiga hampir segaris tanpa NaN atau Infinity', () => {
    const hasil = analisisSegitiga({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 1e-10 });
    expect(hasil.valid).toBe(false);
    expect(Object.values(hasil.sisi).every(Number.isFinite)).toBe(true);
    expect([hasil.luas, hasil.setengahKeliling, hasil.radiusDalam, hasil.radiusLuar].every(Number.isFinite)).toBe(true);
    expect(segitigaHampirDegenerat({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 })).toBe(true);
  });

  it('tetap menghitung segitiga kecil yang tidak degenerat', () => {
    const hasil = analisisSegitiga({ x: 0, y: 0 }, { x: 1e-4, y: 0 }, { x: 0, y: 1e-4 });
    expect(hasil.valid).toBe(true);
    expect([hasil.radiusDalam, hasil.radiusLuar].every(Number.isFinite)).toBe(true);
  });

  it('menghitung pusat dan sumbu sisi dengan nilai finite', () => {
    const hasil = analisisSegitiga({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 });
    expect(hasil.radiusDalam).toBeCloseTo(1);
    expect(hasil.radiusLuar).toBeCloseTo(2.5);
    const sumbu = garisSumbuSisi({ x: 0, y: 0 }, { x: 4, y: 0 });
    expect(sumbu).not.toBeNull();
    expect([sumbu?.awal.x, sumbu?.awal.y, sumbu?.akhir.x, sumbu?.akhir.y].every((nilai) => Number.isFinite(nilai))).toBe(true);
  });
});
