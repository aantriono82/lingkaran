import type { TopicId } from '../../types';
import type { Question } from './types';
import { ambil, bilanganBulat, buatRng } from './rng';
import { hitungBatasArchimedes, N_ARCHIMEDES } from '../../topics/02-keliling/pi/archimedes';
import { ukurKeliling } from '../../topics/02-keliling/pi/data';
import { cariModul } from '../../topics/registry';

const DAFTAR_RADIUS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 24, 25, 28, 30, 32, 35, 36, 40, 42, 44, 45, 46, 48, 50] as const;
const TRIPEL_PYTHAGORAS = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41], [20, 21, 29]] as const;
const SEGITIGA_DALAM = [
  { a: 3, b: 4, c: 5, luas: 6, setengahKeliling: 6, jariJariDalam: 1 },
  { a: 6, b: 8, c: 10, luas: 24, setengahKeliling: 12, jariJariDalam: 2 },
  { a: 5, b: 12, c: 13, luas: 30, setengahKeliling: 15, jariJariDalam: 2 },
  { a: 9, b: 12, c: 15, luas: 54, setengahKeliling: 18, jariJariDalam: 3 },
  { a: 8, b: 15, c: 17, luas: 60, setengahKeliling: 20, jariJariDalam: 3 },
  { a: 7, b: 24, c: 25, luas: 84, setengahKeliling: 28, jariJariDalam: 3 },
  { a: 13, b: 14, c: 15, luas: 84, setengahKeliling: 21, jariJariDalam: 4 },
  { a: 5, b: 5, c: 6, luas: 12, setengahKeliling: 8, jariJariDalam: 1.5 },
  { a: 10, b: 10, c: 12, luas: 48, setengahKeliling: 16, jariJariDalam: 3 }
] as const;

function rapikan(nilai: number): number {
  return Number(nilai.toFixed(2));
}

function angka(nilai: number): string {
  return Number.isInteger(nilai) ? String(nilai) : nilai.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
}

function angkaKoma(nilai: number, desimal = 2): string {
  return nilai.toFixed(desimal).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
}

function ekstrakAngka(input: string): string | null {
  const teks = input.trim().replace(/[−–—﹣－]/g, '-');
  const cocok = teks.match(/^([+-]?\s*(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(?:°|derajat|cm(?:2|²)?|satuan)?$/i);
  return cocok?.[1]?.replace(/\s+/g, '') ?? null;
}

/**
 * Mengembalikan semua tafsiran angka yang sah. Pemisah tunggal dengan tiga
 * digit di belakangnya sengaja dianggap ambigu: `1.386` dapat berarti 1,386
 * atau 1.386. Kecocokan dengan kunci ditentukan oleh jawabanSama.
 */
export function parseNumericCandidates(input: string): number[] {
  const angkaInput = ekstrakAngka(input);
  if (!angkaInput) return [];
  const koma = (angkaInput.match(/,/g) ?? []).length;
  const titik = (angkaInput.match(/\./g) ?? []).length;
  if ((koma > 0 && titik > 0) || koma > 1 || titik > 1) return [];
  const pemisah = koma + titik;
  const normal = angkaInput.replace(',', '.');
  const nilai = Number(normal);
  if (!Number.isFinite(nilai)) return [];
  if (pemisah === 1 && !/[.,]$/.test(angkaInput)) {
    const posisi = Math.max(angkaInput.indexOf(','), angkaInput.indexOf('.'));
    const setelah = angkaInput.length - posisi - 1;
    if (setelah === 3) {
      const tanpaPemisah = Number(angkaInput.replace(/[.,]/, ''));
      return Number.isFinite(tanpaPemisah) ? [nilai === 0 ? 0 : nilai, tanpaPemisah] : [];
    }
  }
  return [nilai === 0 ? 0 : nilai];
}

export function parseNumericAnswer(input: string): number | null {
  const kandidat = parseNumericCandidates(input);
  return kandidat.length === 1 ? kandidat[0] : null;
}

export function pesanKesalahanNumerik(input: string): string | null {
  if (!input.trim()) return 'Masukkan jawaban berupa angka.';
  if (parseNumericCandidates(input).length === 0) return 'Periksa lagi penulisan angka. Gunakan koma atau titik hanya untuk desimal.';
  if (parseNumericCandidates(input).length > 1) return 'Periksa lagi penulisan angka. Gunakan koma atau titik hanya untuk desimal.';
  return null;
}

function pilihanAcak<T>(pilihan: readonly T[], rng: () => number): T[] {
  const hasil = [...pilihan];
  for (let indeks = hasil.length - 1; indeks > 0; indeks -= 1) {
    const tujuan = Math.floor(rng() * (indeks + 1));
    [hasil[indeks], hasil[tujuan]] = [hasil[tujuan], hasil[indeks]];
  }
  return hasil;
}

function pilihanNumerik(jawaban: number, rng: () => number): string[] {
  const set = new Set<number>([jawaban]);
  const langkah = Math.max(1, Math.round(Math.abs(jawaban) / 10));
  for (let indeks = 1; set.size < 4 && indeks <= 8; indeks += 1) {
    const arah = rng() < 0.5 ? -1 : 1;
    set.add(Math.max(0, jawaban + arah * langkah * bilanganBulat(rng, 1, 3)));
  }
  let tambahan = 1;
  while (set.size < 4) {
    set.add(jawaban + langkah * (3 + tambahan));
    tambahan += 1;
  }
  return pilihanAcak([...set], rng).map(angka);
}

export function buatSoalLegacy(topikId: TopicId, seed: number, sertakanSoalAsalPi = true): Question {
  const rng = buatRng(seed);
  if (topikId === '01-unsur') {
    const radius = bilanganBulat(rng, 4, 40);
    const jenis = ambil(rng, ['diameter', 'jari-jari', 'keliling'] as const);
    if (jenis === 'diameter') {
      const jawabanBenar = radius * 2;
      return {
        pertanyaan: `Sebuah lingkaran memiliki jari-jari ${radius} cm. Berapa diameternya?`,
        jenis: 'pilihan',
        pilihan: pilihanNumerik(jawabanBenar, rng),
        jawabanBenar,
        pembahasan: `Diameter = 2 × jari-jari = 2 × ${radius} = ${jawabanBenar} cm.`,
        data: { jenis },
        sumberGeometri: { jenis: 'lingkaran', radius }
      };
    }
    if (jenis === 'jari-jari') {
      const diameter = radius * 2;
      return {
        pertanyaan: `Sebuah lingkaran memiliki diameter ${diameter} cm. Berapa jari-jarinya?`,
        jenis: 'numerik',
        jawabanBenar: radius,
        toleransi: 0.01,
        pembahasan: `Jari-jari = diameter ÷ 2 = ${diameter} ÷ 2 = ${radius} cm.`,
        data: { jenis },
        sumberGeometri: { jenis: 'lingkaran', radius }
      };
    }
    const jawabanBenar = 2 * 3.14 * radius;
    return {
      pertanyaan: `Hitung keliling lingkaran dengan jari-jari ${radius} cm. Gunakan π = 3,14.`,
      jenis: 'numerik',
      jawabanBenar,
      toleransi: 0.02,
      pembahasan: `K = 2πr = 2 × 3,14 × ${radius} = ${angka(jawabanBenar)} cm.`,
      data: { jenis },
      sumberGeometri: { jenis: 'lingkaran', radius }
    };
  }

  if (topikId === '04-sudut') {
    const sudutKeliling = bilanganBulat(rng, 25, 80);
    const jawabanBenar = sudutKeliling * 2;
    return {
      pertanyaan: `Sudut keliling yang menghadap busur AB adalah ${sudutKeliling}°. Berapa sudut pusat yang menghadap busur AB yang sama?`,
      jenis: 'pilihan',
      pilihan: pilihanNumerik(jawabanBenar, rng),
      jawabanBenar,
      pembahasan: `Sudut pusat = 2 × sudut keliling = 2 × ${sudutKeliling}° = ${jawabanBenar}°.`,
      data: { jenis: 'sudut-pusat', sudutKeliling },
      sumberGeometri: { jenis: 'lingkaran', sudutKeliling, sudutPusat: jawabanBenar }
    };
  }

  if (topikId === '02-keliling') {
    const radius = ambil(rng, DAFTAR_RADIUS);
    const pi = radius % 7 === 0 ? 22 / 7 : 3.14;
    const teksPi = pi === 22 / 7 ? '22/7' : '3,14';
    const jenis = ambil(rng, sertakanSoalAsalPi
      ? ['radius', 'diameter', 'balik', 'busur', 'roda', 'ukur', 'rasio', 'apit'] as const
      : ['radius', 'diameter', 'balik', 'busur', 'roda'] as const);
    if (jenis === 'ukur') {
      const benda = ambil(rng, [
        { nama: 'koin', diameter: 2.4 },
        { nama: 'tutup botol', diameter: 3 },
        { nama: 'CD', diameter: 12 },
        { nama: 'piring', diameter: 24 },
        { nama: 'roda sepeda', diameter: 66 }
      ] as const);
      const keliling = ukurKeliling(benda.diameter, 'manual', seed);
      const rasio = keliling / benda.diameter;
      const jawabanBenar = '3,14';
      const pilihan = pilihanAcak([jawabanBenar, '3,40', '2,90', '3,60'], rng);
      return {
        pertanyaan: `Hasil pengukuran ${benda.nama}: d = ${angkaKoma(benda.diameter, 1)} cm dan K = ${angkaKoma(keliling)} cm. Nilai π yang paling dekat dengan K ÷ d adalah ...`,
        jenis: 'pilihan', pilihan, jawabanBenar,
        pembahasan: `K ÷ d = ${angkaKoma(keliling)} ÷ ${angkaKoma(benda.diameter, 1)} ≈ ${angkaKoma(rasio, 2)}, jadi nilai π yang paling dekat adalah 3,14.`,
        data: { jenis, diameter: benda.diameter, keliling, rasio },
        sumberGeometri: { jenis: 'lingkaran', diameter: benda.diameter, keliling }
      };
    }
    if (jenis === 'rasio') {
      const diameter = ambil(rng, [2.4, 3, 6, 9, 12, 15, 18, 24, 30, 36, 42, 48, 54, 66] as const);
      const keliling = ukurKeliling(diameter, 'manual', seed + 17);
      const jawabanBenar = Number((keliling / diameter).toFixed(2));
      return {
        pertanyaan: `Sebuah roda berdiameter ${angkaKoma(diameter, 1)} cm memiliki keliling ${angkaKoma(keliling)} cm. Berapa K ÷ d, dibulatkan dua desimal?`,
        jenis: 'numerik', jawabanBenar, toleransi: 0.005,
        pembahasan: `K ÷ d = ${angkaKoma(keliling)} ÷ ${angkaKoma(diameter, 1)} ≈ ${angkaKoma(jawabanBenar, 2)}.`,
        data: { jenis, diameter, keliling, rasio: keliling / diameter },
        sumberGeometri: { jenis: 'lingkaran', diameter, keliling }
      };
    }
    if (jenis === 'apit') {
      const n = ambil(rng, N_ARCHIMEDES);
      const batas = hitungBatasArchimedes(n);
      const bawah = angkaKoma(batas.bawah, 3);
      const atas = angkaKoma(batas.atas, 3);
      const jawabanBenar = `${bawah} < π < ${atas}`;
      const pilihan = pilihanAcak([
        jawabanBenar,
        `π < ${bawah}`,
        `${atas} < π`,
        `${bawah} < π < ${angkaKoma(batas.atas + 0.1, 3)}`
      ], rng);
      return {
        pertanyaan: `Pada segi-${n}, batas bawah = ${bawah} dan batas atas = ${atas}. Pernyataan yang benar tentang π adalah ...`,
        jenis: 'pilihan', pilihan, jawabanBenar,
        pembahasan: `Keliling segi-${n} dalam dan luar memberi ${bawah} < π < ${atas}.`,
        data: { jenis, n, batasBawah: batas.bawah, batasAtas: batas.atas },
        sumberGeometri: { jenis: 'poligon', n, batasBawah: batas.bawah, batasAtas: batas.atas }
      };
    }
    if (jenis === 'radius') {
      const jawabanBenar = rapikan(2 * pi * radius);
      return { pertanyaan: `Hitung keliling lingkaran dengan jari-jari ${radius} cm. Gunakan π = ${teksPi}.`, jenis: 'numerik', jawabanBenar, toleransi: 0.02, pembahasan: `K = 2πr = 2 × ${teksPi} × ${radius} = ${angka(jawabanBenar)} cm.`, data: { jenis, radius, pi }, sumberGeometri: { jenis: 'lingkaran', radius, pi } };
    }
    if (jenis === 'diameter') {
      const diameter = radius * 2;
      const jawabanBenar = rapikan(pi * diameter);
      return { pertanyaan: `Sebuah lingkaran berdiameter ${diameter} cm. Berapa kelilingnya? Gunakan π = ${teksPi}.`, jenis: 'pilihan', pilihan: pilihanNumerik(jawabanBenar, rng), jawabanBenar, toleransi: 0.02, pembahasan: `K = πd = ${teksPi} × ${diameter} = ${angka(jawabanBenar)} cm.`, data: { jenis, radius, diameter, pi }, sumberGeometri: { jenis: 'lingkaran', radius, diameter, pi } };
    }
    if (jenis === 'balik') {
      const keliling = 2 * pi * radius;
      return { pertanyaan: `Keliling sebuah lingkaran ${angka(keliling)} cm. Gunakan π = ${teksPi}. Berapa jari-jarinya?`, jenis: 'numerik', jawabanBenar: radius, toleransi: 0.02, pembahasan: `r = K ÷ (2π) = ${angka(keliling)} ÷ (2 × ${teksPi}) = ${radius} cm, dengan π = ${teksPi}.`, data: { jenis, radius, keliling, pi }, sumberGeometri: { jenis: 'lingkaran', radius, keliling, pi } };
    }
    if (jenis === 'busur') {
      const sudut = ambil(rng, [60, 90, 120, 180, 270] as const);
      const keliling = 2 * pi * radius;
      const jawabanBenar = rapikan(sudut / 360 * keliling);
      return { pertanyaan: `Jari-jari lingkaran ${radius} cm dan sudut pusatnya ${sudut}°. Berapa panjang busurnya? Gunakan π = ${teksPi}.`, jenis: 'numerik', jawabanBenar, toleransi: 0.02, pembahasan: `Panjang busur = ${sudut}/360 × 2 × ${teksPi} × ${radius} = ${angka(jawabanBenar)} cm.`, data: { jenis, radius, sudut, pi }, sumberGeometri: { jenis: 'lingkaran', radius, sudut, panjangBusur: jawabanBenar, pi } };
    }
    const putaran = ambil(rng, [1, 2, 3, 4, 5, 6, 7, 8] as const);
    const keliling = 2 * pi * radius;
    const jawabanBenar = rapikan(putaran * keliling);
    return { pertanyaan: `Roda sepeda berjari-jari ${radius} cm berputar ${putaran} kali. Berapa jarak yang ditempuh? Gunakan π = ${teksPi}.`, jenis: 'numerik', jawabanBenar, toleransi: 0.02, pembahasan: `Jarak = ${putaran} × (2 × ${teksPi} × ${radius}) = ${angka(jawabanBenar)} cm.`, data: { jenis, radius, putaran, pi }, sumberGeometri: { jenis: 'lingkaran', radius, putaran, jarak: jawabanBenar, pi } };
  }

  if (topikId === '03-luas') {
    const radius = ambil(rng, DAFTAR_RADIUS);
    const pi = radius % 7 === 0 ? 22 / 7 : 3.14;
    const teksPi = pi === 22 / 7 ? '22/7' : '3,14';
    const jenis = ambil(rng, ['radius', 'diameter', 'balik', 'juring', 'gabungan', 'setengah'] as const);
    if (jenis === 'radius') {
      const jawabanBenar = rapikan(pi * radius ** 2);
      return { pertanyaan: `Hitung luas lingkaran dengan jari-jari ${radius} cm. Gunakan π = ${teksPi}.`, jenis: 'numerik', jawabanBenar, toleransi: 0.02, pembahasan: `L = πr² = ${teksPi} × ${radius}² = ${angka(jawabanBenar)} cm².`, data: { jenis, radius, pi }, sumberGeometri: { jenis: 'lingkaran', radius, luas: jawabanBenar, pi } };
    }
    if (jenis === 'diameter') {
      const diameter = radius * 2;
      const jawabanBenar = rapikan(pi * (diameter / 2) ** 2);
      return { pertanyaan: `Sebuah lingkaran berdiameter ${diameter} cm. Berapa luasnya? Gunakan π = ${teksPi}.`, jenis: 'pilihan', pilihan: pilihanNumerik(jawabanBenar, rng), jawabanBenar, toleransi: 0.02, pembahasan: `r = d/2 = ${radius} cm, jadi dengan π = ${teksPi}, L = ${angka(jawabanBenar)} cm².`, data: { jenis, radius, diameter, pi }, sumberGeometri: { jenis: 'lingkaran', radius, diameter, luas: jawabanBenar, pi } };
    }
    if (jenis === 'balik') {
      const luas = pi * radius ** 2;
      return { pertanyaan: `Luas lingkaran ${angka(luas)} cm². Gunakan π = ${teksPi}. Berapa jari-jarinya?`, jenis: 'numerik', jawabanBenar: radius, toleransi: 0.02, pembahasan: `r = √(L/π) = √(${angka(luas)} ÷ ${teksPi}) = ${radius} cm.`, data: { jenis, radius, luas, pi }, sumberGeometri: { jenis: 'lingkaran', radius, luas, pi } };
    }
    if (jenis === 'juring') {
      const sudut = ambil(rng, [60, 90, 120, 180, 270] as const);
      const jawabanBenar = rapikan(sudut / 360 * pi * radius ** 2);
      return { pertanyaan: `Jari-jari lingkaran ${radius} cm dan sudut pusat juring ${sudut}°. Berapa luas juringnya? Gunakan π = ${teksPi}.`, jenis: 'numerik', jawabanBenar, toleransi: 0.02, pembahasan: `L juring = ${sudut}/360 × ${teksPi} × ${radius}² = ${angka(jawabanBenar)} cm².`, data: { jenis, radius, sudut, pi }, sumberGeometri: { jenis: 'juring', radius, sudut, luas: jawabanBenar, pi } };
    }
    if (jenis === 'gabungan') {
      const sisi = radius * 2;
      const jawabanBenar = rapikan(sisi ** 2 - pi * radius ** 2);
      return { pertanyaan: `Sebuah lingkaran berjari-jari ${radius} cm berada di dalam persegi bersisi ${sisi} cm. Berapa luas daerah persegi di luar lingkaran? Gunakan π = ${teksPi}.`, jenis: 'numerik', jawabanBenar, toleransi: 0.02, pembahasan: `Luas daerah = ${sisi}² − ${teksPi} × ${radius}² = ${angka(jawabanBenar)} cm².`, data: { jenis, radius, sisi, pi }, sumberGeometri: { jenis: 'persegi-dan-lingkaran', radius, sisi, luasLuar: jawabanBenar, pi } };
    }
    const jawabanBenar = rapikan(pi * radius ** 2 / 2);
    return { pertanyaan: `Hitung luas setengah lingkaran berjari-jari ${radius} cm. Gunakan π = ${teksPi}.`, jenis: 'numerik', jawabanBenar, toleransi: 0.02, pembahasan: `L = 1/2 × ${teksPi} × ${radius}² = ${angka(jawabanBenar)} cm².`, data: { jenis, radius, pi }, sumberGeometri: { jenis: 'setengah-lingkaran', radius, luas: jawabanBenar, pi } };
  }

  if (topikId === '05-tali-busur') {
    const mode = ambil(rng, ['dalam', 'luar'] as const);
    const jenis = ambil(rng, ['dua-busur', 'cari-busur'] as const);
    const busurPertama = bilanganBulat(rng, 50, 150);
    const busurKedua = mode === 'dalam' ? bilanganBulat(rng, 40, 150) : bilanganBulat(rng, 20, busurPertama - 10);
    const sudut = (mode === 'dalam' ? busurPertama + busurKedua : busurPertama - busurKedua) / 2;
    const keteranganLuar = 'Perpanjangan dua tali busur (garis secan) berpotongan di luar lingkaran';
    if (jenis === 'dua-busur') {
      return { pertanyaan: `${mode === 'dalam' ? 'Dua tali busur berpotongan di dalam lingkaran' : keteranganLuar}. Busur ${mode === 'dalam' ? 'yang dihadapinya' : 'jauh dan dekat'} masing-masing ${busurPertama}° dan ${busurKedua}°. Berapa besar sudut perpotongannya?`, jenis: 'numerik', jawabanBenar: sudut, toleransi: 0.01, pembahasan: `Sudut = 1/2 × (${mode === 'dalam' ? `${busurPertama} + ${busurKedua}` : `${busurPertama} − ${busurKedua}`}) = ${angka(sudut)}°.`, data: { jenis, mode, busurPertama, busurKedua, sudut }, sumberGeometri: { jenis: 'tali-busur', mode, busurPertama, busurKedua, sudut } };
    }
    const sudutDiberikan = mode === 'dalam'
      ? bilanganBulat(rng, Math.ceil(busurPertama / 2) + 10, 120)
      : bilanganBulat(rng, 10, Math.max(10, Math.floor((busurPertama - 10) / 2)));
    const busurAman = mode === 'dalam' ? 2 * sudutDiberikan - busurPertama : busurPertama - 2 * sudutDiberikan;
    const sudutAman = mode === 'dalam' ? (busurPertama + busurAman) / 2 : Math.abs(busurPertama - busurAman) / 2;
    return { pertanyaan: `${mode === 'dalam' ? 'Sudut perpotongan dua tali busur di dalam lingkaran' : `${keteranganLuar}, dengan sudut perpotongan`} adalah ${angka(sudutAman)}°. ${mode === 'dalam' ? 'Salah satu busur' : 'Busur jauh'} ${busurPertama}°. Berapa besar ${mode === 'dalam' ? 'busur pasangannya' : 'busur dekat'}?`, jenis: 'pilihan', pilihan: pilihanNumerik(busurAman, rng), jawabanBenar: busurAman, toleransi: 0.01, pembahasan: mode === 'dalam' ? `Busur lain = 2 × ${angka(sudutAman)} − ${busurPertama} = ${busurAman}°.` : `Busur dekat = ${busurPertama} − 2 × ${angka(sudutAman)} = ${busurAman}° (selisih busur jauh dan dekat).`, data: { jenis, mode, busurPertama, sudut: sudutAman, busurKedua: busurAman }, sumberGeometri: { jenis: 'tali-busur', mode, busurPertama, busurKedua: busurAman, sudut: sudutAman } };
  }

  if (topikId === '06-segi-empat') {
    const jenis = ambil(rng, ['berhadapan', 'aljabar', 'luar'] as const);
    if (jenis === 'berhadapan') {
      const sudutDiketahui = bilanganBulat(rng, 25, 155);
      const jawabanBenar = 180 - sudutDiketahui;
      return {
        pertanyaan: `Pada segi empat tali busur, salah satu sudut dalam adalah ${sudutDiketahui}°. Berapa sudut dalam yang berhadapan dengannya?`,
        jenis: 'numerik', jawabanBenar, toleransi: 0.01,
        pembahasan: `Sudut berhadapan berjumlah 180°, jadi 180° − ${sudutDiketahui}° = ${jawabanBenar}°.`,
        data: { jenis, sudutDiketahui },
        sumberGeometri: { jenis: 'segi-empat-tali-busur', sudutDiketahui, sudutBerhadapan: jawabanBenar }
      };
    }
    if (jenis === 'aljabar') {
      const x = bilanganBulat(rng, 10, 50);
      const konstanta = 160 - 5 * x;
      return {
        pertanyaan: `Dua sudut berhadapan pada segi empat tali busur adalah (2x + 20)° dan (3x + ${konstanta})°. Tentukan nilai x.`,
        jenis: 'numerik', jawabanBenar: x, toleransi: 0.01,
        pembahasan: `2x + 20 + 3x + ${konstanta} = 180, sehingga 5x = ${160 - konstanta} dan x = ${x}.`,
        data: { jenis, x, konstanta },
        sumberGeometri: { jenis: 'segi-empat-tali-busur', x, konstanta }
      };
    }
    const sudutLuar = bilanganBulat(rng, 35, 145);
    return {
      pertanyaan: `Sebuah sudut luar segi empat tali busur besarnya ${sudutLuar}°. Berapa sudut dalam yang berhadapan dengannya?`,
      jenis: 'numerik', jawabanBenar: sudutLuar, toleransi: 0.01,
      pembahasan: `Sudut luar sama dengan sudut dalam yang berhadapan, jadi jawabannya ${sudutLuar}°.`,
      data: { jenis, sudutLuar },
      sumberGeometri: { jenis: 'segi-empat-tali-busur', sudutLuar }
    };
  }

  if (topikId === '07-dalam-segitiga') {
    const jenis = ambil(rng, ['radius', 'luas', 'siku-siku'] as const);
    if (jenis === 'luas') {
      const dasar = ambil(rng, SEGITIGA_DALAM);
      const skala = bilanganBulat(rng, 1, 4);
      const a = dasar.a * skala;
      const b = dasar.b * skala;
      const c = dasar.c * skala;
      const radius = dasar.jariJariDalam * skala;
      const setengahKeliling = dasar.setengahKeliling * skala;
      const luas = dasar.luas * skala ** 2;
      return {
        pertanyaan: `Sebuah segitiga bersisi ${a} cm, ${b} cm, dan ${c} cm memiliki jari-jari lingkaran dalam r = ${angka(radius)} cm serta setengah keliling s = ${setengahKeliling} cm. Berapa luas segitiga itu?`,
        jenis: 'numerik', jawabanBenar: luas, toleransi: 0.01,
        pembahasan: `L = r × s = ${angka(radius)} × ${setengahKeliling} = ${luas} cm².`,
        data: { jenis, radius, setengahKeliling, a, b, c, luas },
        sumberGeometri: { jenis: 'segitiga', a, b, c, luas, setengahKeliling, jariJariDalam: radius }
      };
    }
    const dasar = ambil(rng, TRIPEL_PYTHAGORAS);
    const kelipatan = bilanganBulat(rng, 1, 8);
    const a = dasar[0] * kelipatan;
    const b = dasar[1] * kelipatan;
    const c = dasar[2] * kelipatan;
    const jawabanBenar = (a + b - c) / 2;
    return {
      pertanyaan: jenis === 'siku-siku'
        ? `Segitiga siku-siku memiliki sisi siku-siku ${a} cm dan ${b} cm, serta sisi miring ${c} cm. Gunakan r = (a + b − c)/2 untuk mencari jari-jari lingkaran dalam.`
        : `Segitiga siku-siku memiliki sisi ${a} cm, ${b} cm, dan ${c} cm. Berapa jari-jari lingkaran dalamnya?`,
      jenis: 'numerik', jawabanBenar, toleransi: 0.01,
      pembahasan: `r = (a + b − c)/2 = (${a} + ${b} − ${c})/2 = ${angka(jawabanBenar)} cm.`,
      data: { jenis, a, b, c },
      sumberGeometri: { jenis: 'segitiga', a, b, c, luas: a * b / 2, setengahKeliling: (a + b + c) / 2, jariJariDalam: jawabanBenar }
    };
  }

  if (topikId === '08-luar-segitiga') {
    const jenis = ambil(rng, ['tripel', 'sama-kaki', 'siku-siku', 'klasifikasi'] as const);
    if (jenis === 'klasifikasi') {
      const pilihan = ambil(rng, [
        { a: 5, b: 6, c: 7, nama: 'lancip' },
        { a: 6, b: 7, c: 8, nama: 'lancip' },
        { a: 7, b: 8, c: 9, nama: 'lancip' },
        { a: 8, b: 9, c: 10, nama: 'lancip' },
        { a: 3, b: 4, c: 5, nama: 'siku-siku' },
        { a: 6, b: 8, c: 10, nama: 'siku-siku' },
        { a: 9, b: 12, c: 15, nama: 'siku-siku' },
        { a: 2, b: 3, c: 4, nama: 'tumpul' },
        { a: 4, b: 5, c: 7, nama: 'tumpul' },
        { a: 5, b: 6, c: 8, nama: 'tumpul' }
      ] as const);
      const lokasi = pilihan.nama === 'lancip' ? 'di dalam' : pilihan.nama === 'siku-siku' ? 'pada sisi miring' : 'di luar';
      return {
        pertanyaan: `Segitiga memiliki sisi ${pilihan.a} cm, ${pilihan.b} cm, dan ${pilihan.c} cm. Pusat lingkaran luar berada ${lokasi} segitiga. Apa jenis segitiganya?`,
        jenis: 'pilihan', pilihan: pilihanAcak(['lancip', 'siku-siku', 'tumpul'], rng), jawabanBenar: pilihan.nama,
        pembahasan: `Karena pusat lingkaran luar berada ${lokasi} segitiga, segitiganya ${pilihan.nama}.`,
        data: { jenis, a: pilihan.a, b: pilihan.b, c: pilihan.c },
        sumberGeometri: { jenis: 'segitiga', a: pilihan.a, b: pilihan.b, c: pilihan.c, klasifikasi: pilihan.nama }
      };
    }
    if (jenis === 'sama-kaki') {
      const pilihan = ambil(rng, [
        { kaki: 5, alas: 6, luas: 12 },
        { kaki: 13, alas: 10, luas: 60 },
        { kaki: 10, alas: 12, luas: 48 },
        { kaki: 17, alas: 16, luas: 120 },
        { kaki: 25, alas: 14, luas: 168 },
        { kaki: 29, alas: 42, luas: 420 },
        { kaki: 26, alas: 20, luas: 240 },
        { kaki: 41, alas: 18, luas: 360 }
      ] as const);
      const skala = bilanganBulat(rng, 1, 5);
      const kaki = pilihan.kaki * skala;
      const alas = pilihan.alas * skala;
      const luas = pilihan.luas * skala ** 2;
      const jawabanBenar = rapikan(kaki * kaki * alas / (4 * luas));
      return {
        pertanyaan: `Segitiga sama kaki memiliki sisi ${kaki} cm, ${kaki} cm, alas ${alas} cm, dan luas ${luas} cm². Berapa jari-jari lingkaran luarnya?`,
        jenis: 'numerik', jawabanBenar, toleransi: 0.02,
        pembahasan: `R = abc/(4L) = ${kaki} × ${kaki} × ${alas} ÷ (4 × ${luas}) = ${angka(jawabanBenar)} cm.`,
        data: { jenis, a: kaki, b: kaki, c: alas, luas },
        sumberGeometri: { jenis: 'segitiga', a: kaki, b: kaki, c: alas, luas, jariJariLuar: jawabanBenar }
      };
    }
    const dasar = ambil(rng, TRIPEL_PYTHAGORAS);
    const kelipatan = bilanganBulat(rng, 1, 8);
    const a = dasar[0] * kelipatan;
    const b = dasar[1] * kelipatan;
    const c = dasar[2] * kelipatan;
    const jawabanBenar = c / 2;
    return {
      pertanyaan: jenis === 'siku-siku'
        ? `Segitiga siku-siku memiliki sisi miring ${c} cm. Berapa jari-jari lingkaran luarnya?`
        : `Segitiga memiliki sisi ${a} cm, ${b} cm, dan ${c} cm. Berapa jari-jari lingkaran luarnya?`,
      jenis: 'numerik', jawabanBenar, toleransi: 0.02,
      pembahasan: `Segitiga siku-siku memiliki R = 1/2 × sisi miring = ${c}/2 = ${angka(jawabanBenar)} cm.`,
      data: { jenis, a, b, c },
      sumberGeometri: { jenis: 'segitiga', a, b, c, luas: a * b / 2, jariJariLuar: jawabanBenar }
    };
  }

  if (topikId === '09-garis-singgung') {
    const dasar = ambil(rng, TRIPEL_PYTHAGORAS);
    const kelipatan = bilanganBulat(rng, 1, 8);
    const sisiTegak = dasar[0] * kelipatan;
    const panjang = dasar[1] * kelipatan;
    const jarak = dasar[2] * kelipatan;
    const jenis = ambil(rng, ['panjang', 'cari-radius', 'cari-jarak', 'luar', 'dalam', 'sudut'] as const);
    if (jenis === 'panjang') {
      return {
        pertanyaan: `Titik P berjarak ${jarak} cm dari pusat O sebuah lingkaran berjari-jari ${sisiTegak} cm. Berapa panjang garis singgung PT?`,
        jenis: 'numerik', jawabanBenar: panjang, toleransi: 0.01,
        pembahasan: `PT = √(OP² − OT²) = √(${jarak}² − ${sisiTegak}²) = ${panjang} cm.`,
        data: { jenis, d: jarak, radius: sisiTegak, panjang },
        sumberGeometri: { jenis: 'segitiga-siku-siku', radius: sisiTegak, panjang, d: jarak }
      };
    }
    if (jenis === 'cari-radius') {
      return {
        pertanyaan: `Panjang garis singgung PT adalah ${panjang} cm dan OP = ${jarak} cm. Berapa jari-jari lingkarannya?`,
        jenis: 'numerik', jawabanBenar: sisiTegak, toleransi: 0.01,
        pembahasan: `r = √(OP² − PT²) = √(${jarak}² − ${panjang}²) = ${sisiTegak} cm.`,
        data: { jenis, d: jarak, radius: sisiTegak, panjang },
        sumberGeometri: { jenis: 'segitiga-siku-siku', radius: sisiTegak, panjang, d: jarak }
      };
    }
    if (jenis === 'cari-jarak') {
      return {
        pertanyaan: `Jari-jari lingkaran ${sisiTegak} cm dan panjang garis singgung ${panjang} cm. Berapa jarak OP?`,
        jenis: 'numerik', jawabanBenar: jarak, toleransi: 0.01,
        pembahasan: `OP = √(r² + PT²) = √(${sisiTegak}² + ${panjang}²) = ${jarak} cm.`,
        data: { jenis, d: jarak, radius: sisiTegak, panjang },
        sumberGeometri: { jenis: 'segitiga-siku-siku', radius: sisiTegak, panjang, d: jarak }
      };
    }
    if (jenis === 'luar') {
      const radiusKecil = sisiTegak * 2;
      const radiusBesar = radiusKecil + sisiTegak;
      return {
        pertanyaan: `Dua lingkaran berjari-jari ${radiusBesar} cm dan ${radiusKecil} cm memiliki jarak pusat ${jarak} cm. Berapa panjang garis singgung persekutuan luar?`,
        jenis: 'numerik', jawabanBenar: panjang, toleransi: 0.01,
        pembahasan: `l = √(d² − (R − r)²) = √(${jarak}² − ${sisiTegak}²) = ${panjang} cm.`,
        data: { jenis, d: jarak, R: radiusBesar, r: radiusKecil, selisih: sisiTegak, panjang },
        sumberGeometri: { jenis: 'dua-lingkaran', R: radiusBesar, r: radiusKecil, d: jarak, panjang, kedudukan: 'garis singgung persekutuan luar' }
      };
    }
    if (jenis === 'dalam') {
      const radiusKecil = Math.max(1, Math.floor(sisiTegak / 3));
      const radiusBesar = sisiTegak - radiusKecil;
      return {
        pertanyaan: `Dua lingkaran berjari-jari ${radiusBesar} cm dan ${radiusKecil} cm memiliki jarak pusat ${jarak} cm. Berapa panjang garis singgung persekutuan dalam?`,
        jenis: 'numerik', jawabanBenar: panjang, toleransi: 0.01,
        pembahasan: `l = √(d² − (R + r)²) = √(${jarak}² − ${sisiTegak}²) = ${panjang} cm.`,
        data: { jenis, d: jarak, R: radiusBesar, r: radiusKecil, jumlah: sisiTegak, panjang },
        sumberGeometri: { jenis: 'dua-lingkaran', R: radiusBesar, r: radiusKecil, d: jarak, panjang, kedudukan: 'garis singgung persekutuan dalam' }
      };
    }
    return {
      pertanyaan: `Pada segitiga siku-siku OTP, berapa besar sudut OTP saat PT menyinggung lingkaran di T?`,
      jenis: 'pilihan', pilihan: pilihanNumerik(90, rng), jawabanBenar: 90,
      pembahasan: 'Jari-jari OT tegak lurus garis singgung PT, jadi ∠OTP = 90°.',
      data: { jenis, sudut: 90 },
      sumberGeometri: { jenis: 'garis-singgung', sudut: 90 }
    };
  }

  if (topikId === '10-kedudukan') {
    const radiusBesar = bilanganBulat(rng, 5, 40);
    const radiusKecil = bilanganBulat(rng, 2, radiusBesar - 2);
    const jumlah = radiusBesar + radiusKecil;
    const selisih = radiusBesar - radiusKecil;
    const jenis = ambil(rng, ['klasifikasi', 'jumlah-garis', 'jumlah-titik', 'cari-d-luar', 'cari-d-dalam', 'rentang-potong'] as const);
    const posisi = ambil(rng, ['lepas', 'luar', 'potong', 'dalam', 'isi', 'sepusat'] as const);
    const jarakPosisi = posisi === 'lepas' ? jumlah + 2 : posisi === 'luar' ? jumlah : posisi === 'potong' ? Math.floor((selisih + jumlah) / 2) : posisi === 'dalam' ? selisih : posisi === 'isi' ? Math.max(1, selisih - 1) : 0;
    const namaPosisi = posisi === 'lepas' ? 'saling lepas' : posisi === 'luar' ? 'bersinggungan luar' : posisi === 'potong' ? 'berpotongan di dua titik' : posisi === 'dalam' ? 'bersinggungan dalam' : posisi === 'isi' ? 'satu di dalam yang lain' : 'sepusat';
    const jumlahGaris = posisi === 'lepas' ? 4 : posisi === 'luar' ? 3 : posisi === 'potong' ? 2 : posisi === 'dalam' ? 1 : 0;
    const jumlahTitik = posisi === 'luar' || posisi === 'dalam' ? 1 : posisi === 'potong' ? 2 : 0;
    if (jenis === 'klasifikasi') {
      const pilihan = ['saling lepas', 'bersinggungan luar', 'berpotongan di dua titik', 'bersinggungan dalam', 'satu di dalam yang lain', 'sepusat'];
      return {
        pertanyaan: `R = ${radiusBesar} cm, r = ${radiusKecil} cm, dan d = ${jarakPosisi} cm. Tentukan kedudukan kedua lingkaran.`,
        jenis: 'pilihan', pilihan: pilihanAcak(pilihan, rng), jawabanBenar: namaPosisi,
        pembahasan: `Bandingkan d = ${jarakPosisi} dengan R + r = ${jumlah} dan R − r = ${selisih}. Kedudukannya ${namaPosisi}.`,
        data: { jenis, R: radiusBesar, r: radiusKecil, d: jarakPosisi, posisi: namaPosisi },
        sumberGeometri: { jenis: 'dua-lingkaran', R: radiusBesar, r: radiusKecil, d: jarakPosisi, posisi: namaPosisi }
      };
    }
    if (jenis === 'jumlah-garis') {
      return {
        pertanyaan: `Dua lingkaran memiliki R = ${radiusBesar} cm, r = ${radiusKecil} cm, dan d = ${jarakPosisi} cm. Berapa garis singgung persekutuan yang mungkin?`,
        jenis: 'pilihan', pilihan: pilihanNumerik(jumlahGaris, rng), jawabanBenar: jumlahGaris,
        pembahasan: `Kedudukannya ${namaPosisi}, sehingga ada ${jumlahGaris} garis singgung persekutuan.`,
        data: { jenis, R: radiusBesar, r: radiusKecil, d: jarakPosisi, jumlahGaris },
        sumberGeometri: { jenis: 'dua-lingkaran', R: radiusBesar, r: radiusKecil, d: jarakPosisi, posisi: namaPosisi }
      };
    }
    if (jenis === 'jumlah-titik') {
      return {
        pertanyaan: `Dua lingkaran memiliki R = ${radiusBesar} cm, r = ${radiusKecil} cm, dan d = ${jarakPosisi} cm. Berapa titik persekutuan keduanya?`,
        jenis: 'pilihan', pilihan: pilihanNumerik(jumlahTitik, rng), jawabanBenar: jumlahTitik,
        pembahasan: `Kedudukannya ${namaPosisi}, sehingga ada ${jumlahTitik} titik persekutuan.`,
        data: { jenis, R: radiusBesar, r: radiusKecil, d: jarakPosisi, jumlahTitik },
        sumberGeometri: { jenis: 'dua-lingkaran', R: radiusBesar, r: radiusKecil, d: jarakPosisi, posisi: namaPosisi }
      };
    }
    if (jenis === 'cari-d-luar') {
      return {
        pertanyaan: `Dua lingkaran bersinggungan luar dengan R = ${radiusBesar} cm dan r = ${radiusKecil} cm. Berapa d?`,
        jenis: 'numerik', jawabanBenar: jumlah, toleransi: 0.01,
        pembahasan: `Bersinggungan luar berarti d = R + r = ${radiusBesar} + ${radiusKecil} = ${jumlah} cm.`,
        data: { jenis, R: radiusBesar, r: radiusKecil, d: jumlah },
        sumberGeometri: { jenis: 'dua-lingkaran', R: radiusBesar, r: radiusKecil, d: jumlah, posisi: namaPosisi }
      };
    }
    if (jenis === 'cari-d-dalam') {
      return {
        pertanyaan: `Dua lingkaran bersinggungan dalam dengan R = ${radiusBesar} cm dan r = ${radiusKecil} cm. Berapa d?`,
        jenis: 'numerik', jawabanBenar: selisih, toleransi: 0.01,
        pembahasan: `Bersinggungan dalam berarti d = R − r = ${radiusBesar} − ${radiusKecil} = ${selisih} cm.`,
        data: { jenis, R: radiusBesar, r: radiusKecil, d: selisih },
        sumberGeometri: { jenis: 'dua-lingkaran', R: radiusBesar, r: radiusKecil, d: selisih, posisi: namaPosisi }
      };
    }
    const rentang = `${selisih} < d < ${jumlah}`;
    return {
      pertanyaan: `Dua lingkaran berjari-jari R = ${radiusBesar} cm dan r = ${radiusKecil} cm berpotongan di dua titik. Pilih syarat d yang benar.`,
      jenis: 'pilihan', pilihan: pilihanAcak([rentang, `d > ${jumlah}`, `d = ${jumlah}`, `d < ${selisih}`], rng), jawabanBenar: rentang,
      pembahasan: `Dua titik persekutuan terjadi jika R − r < d < R + r, yaitu ${rentang}.`,
      data: { jenis, R: radiusBesar, r: radiusKecil, d: jarakPosisi, selisih, jumlah, rentang },
      sumberGeometri: { jenis: 'dua-lingkaran', R: radiusBesar, r: radiusKecil, d: jarakPosisi, posisi: namaPosisi }
    };
  }

  const angkaDasar = bilanganBulat(rng, 3, 12);
  return {
    pertanyaan: `Jika panjang sebuah jari-jari adalah ${angkaDasar} cm, berapa panjang diameternya?`,
    jenis: 'numerik',
    jawabanBenar: angkaDasar * 2,
    toleransi: 0.01,
    pembahasan: `Diameter = 2 × jari-jari = ${angkaDasar * 2} cm.`,
    sumberGeometri: { jenis: 'lingkaran', radius: angkaDasar, diameter: angkaDasar * 2 }
  };
}

export function buatSoal(topikId: TopicId, seed: number): Question {
  const modul = cariModul(topikId);
  return modul ? modul.generator(seed) : buatSoalLegacy(topikId, seed);
}

function questionSignature(question: Question): string {
  return JSON.stringify([question.pertanyaan, question.jenis, question.pilihan ?? [], question.jawabanBenar]);
}

export function buatPaketKuis(topikId: TopicId, seed: number): Question[] {
  function bangun(indeks: number, sebelumnya: Question[], signatures: Set<string>, jumlahSoalAsalPi: number): Question[] | null {
    if (indeks === 5) return sebelumnya;
    for (let percobaan = 0; percobaan < 1000; percobaan += 1) {
      const candidateSeed = seed + indeks * 97 + percobaan;
      const soal = cariModul(topikId)?.generator(candidateSeed, { sertakanSoalAsalPi: topikId !== '02-keliling' || jumlahSoalAsalPi === 0 }) ?? buatSoalLegacy(topikId, candidateSeed, topikId !== '02-keliling' || jumlahSoalAsalPi === 0);
      const jenis = String(soal.data?.jenis);
      const asalPi = topikId === '02-keliling' && ['ukur', 'rasio', 'apit'].includes(jenis);
      const tigaSama = topikId !== '04-sudut' && sebelumnya.length >= 2 && String(sebelumnya[sebelumnya.length - 1].data?.jenis) === jenis && String(sebelumnya[sebelumnya.length - 2].data?.jenis) === jenis;
      const signature = questionSignature(soal);
      if (signatures.has(signature) || tigaSama || (asalPi && jumlahSoalAsalPi > 0)) continue;
      const nextSignatures = new Set(signatures);
      nextSignatures.add(signature);
      const next = bangun(indeks + 1, [...sebelumnya, soal], nextSignatures, jumlahSoalAsalPi + (asalPi ? 1 : 0));
      if (next) return next;
    }
    return null;
  }
  const paket = bangun(0, [], new Set<string>(), 0);
  if (!paket) throw new Error(`Tidak dapat membentuk paket kuis unik untuk ${topikId}`);
  return paket;
}

export function jawabanSama(question: Question, jawaban: string): boolean {
  if (typeof question.jawabanBenar === 'number') {
    const target = question.jawabanBenar;
    return parseNumericCandidates(jawaban).some((nilai) => Math.abs(nilai - target) <= (question.toleransi ?? 0.01));
  }
  return jawaban.trim().toLowerCase() === question.jawabanBenar.trim().toLowerCase();
}
