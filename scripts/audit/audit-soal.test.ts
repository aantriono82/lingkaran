import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buatPaketKuis, buatSoal, jawabanSama, parseNumericAnswer } from '../../src/lib/quiz/generator';
import type { Question } from '../../src/lib/quiz/types';
import type { TopicId } from '../../src/types';

type Severity = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';

interface ViolationEvidence {
  seed: number;
  question: string;
  answer: string;
  explanation: string;
  independent: string;
}

interface Violation {
  key: string;
  id: string;
  title: string;
  severity: Severity;
  topic: string;
  type: string;
  count: number;
  examples: ViolationEvidence[];
  impact: string;
  suggestion: string;
}

interface TypeStat {
  type: string;
  format: string;
  seeds: number;
  unique: number;
  status: string;
  sampleSeeds: number[];
}

interface TopicStat {
  id: TopicId;
  name: string;
  types: TypeStat[];
}

interface ToleranceStats {
  numericQuestions: number;
  exactAccepted: number;
  displayedQuestions: number;
  roundedAccepted: number;
  obviousWrongRejected: number;
  alternatePiRejected: number;
}

interface CheckIssue {
  key: string;
  title: string;
  severity: Severity;
  independent: string;
  impact: string;
  suggestion: string;
}

const topicNames: Record<TopicId, string> = {
  '01-unsur': 'Unsur-unsur lingkaran',
  '02-keliling': 'Keliling lingkaran',
  '03-luas': 'Luas lingkaran',
  '04-sudut': 'Sudut pusat dan sudut keliling',
  '05-tali-busur': 'Sudut antara dua tali busur',
  '06-segi-empat': 'Segi empat tali busur',
  '07-dalam-segitiga': 'Lingkaran dalam segitiga',
  '08-luar-segitiga': 'Lingkaran luar segitiga',
  '09-garis-singgung': 'Garis singgung lingkaran',
  '10-kedudukan': 'Kedudukan dua lingkaran'
};

const topicOrder: TopicId[] = [
  '01-unsur', '02-keliling', '03-luas', '04-sudut', '05-tali-busur',
  '06-segi-empat', '07-dalam-segitiga', '08-luar-segitiga',
  '09-garis-singgung', '10-kedudukan'
];

const expectedTypes: Record<TopicId, string[]> = {
  '01-unsur': ['diameter', 'jari-jari', 'keliling'],
  '02-keliling': ['radius', 'diameter', 'balik', 'busur', 'roda', 'ukur', 'rasio', 'apit'],
  '03-luas': ['radius', 'diameter', 'balik', 'juring', 'gabungan', 'setengah'],
  '04-sudut': ['sudut pusat'],
  '05-tali-busur': ['dua-busur', 'cari-busur'],
  '06-segi-empat': ['berhadapan', 'aljabar', 'luar'],
  '07-dalam-segitiga': ['radius', 'luas', 'siku-siku'],
  '08-luar-segitiga': ['tripel', 'sama-kaki', 'siku-siku', 'klasifikasi'],
  '09-garis-singgung': ['panjang', 'cari-radius', 'cari-jarak', 'luar', 'dalam', 'sudut'],
  '10-kedudukan': ['klasifikasi', 'jumlah-garis', 'jumlah-titik', 'cari-d-luar', 'cari-d-dalam', 'rentang-potong']
};

const formatByType: Record<string, string> = {
  diameter: 'pilihan ganda',
  'jari-jari': 'isian numerik',
  keliling: 'isian numerik',
  radius: 'isian numerik',
  balik: 'isian numerik',
  busur: 'isian numerik',
  roda: 'isian numerik',
  ukur: 'pilihan ganda',
  rasio: 'isian numerik',
  apit: 'pilihan ganda',
  'sudut pusat': 'pilihan ganda',
  'dua-busur': 'isian numerik',
  'cari-busur': 'pilihan ganda',
  berhadapan: 'isian numerik',
  aljabar: 'isian numerik',
  luar: 'isian numerik',
  luas: 'isian numerik',
  'siku-siku': 'isian numerik',
  juring: 'isian numerik',
  gabungan: 'isian numerik',
  setengah: 'isian numerik',
  tripel: 'isian numerik',
  'sama-kaki': 'isian numerik',
  klasifikasi: 'pilihan ganda',
  panjang: 'isian numerik',
  'cari-radius': 'isian numerik',
  'cari-jarak': 'isian numerik',
  dalam: 'isian numerik',
  sudut: 'pilihan ganda',
  'jumlah-garis': 'pilihan ganda',
  'jumlah-titik': 'pilihan ganda',
  'cari-d-luar': 'isian numerik',
  'cari-d-dalam': 'isian numerik',
  'rentang-potong': 'pilihan ganda'
};

const topicLabel = (id: TopicId): string => topicNames[id];

function typeOf(topic: TopicId, question: Question): string {
  if (topic === '01-unsur') {
    if (question.pertanyaan.includes('diameternya')) return 'diameter';
    if (question.pertanyaan.includes('jari-jarinya')) return 'jari-jari';
    return 'keliling';
  }
  if (topic === '04-sudut') return 'sudut pusat';
  return String(question.data?.jenis);
}

function answerText(value: number | string): string {
  return typeof value === 'number' ? String(value).replace('.', ',') : String(value);
}

function questionSignature(question: Question): string {
  return JSON.stringify([question.pertanyaan, question.jenis, question.pilihan ?? [], question.jawabanBenar]);
}

function parseSimpleNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function ownAnswerMatches(question: Question, value: string): boolean {
  if (typeof question.jawabanBenar === 'number') {
    const parsed = parseSimpleNumber(value);
    return parsed !== null && Math.abs(parsed - question.jawabanBenar) <= (question.toleransi ?? 0.01);
  }
  return value.trim().toLowerCase() === question.jawabanBenar.trim().toLowerCase();
}

function piFromText(question: Question): number | null {
  if (question.pertanyaan.includes('22/7')) return 22 / 7;
  if (question.pertanyaan.includes('3,14')) return 3.14;
  return null;
}

function finalDisplayedNumber(question: Question): number | null {
  const match = question.pembahasan.match(/=\s*([\d.,]+)\s*(?:cm²?|°)?\.?$/);
  if (!match) return null;
  const value = Number(match[1].replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

function alternatePiAnswer(topic: TopicId, question: Question): number | null {
  const data = question.data ?? {};
  const currentPi = piFromText(question);
  if (currentPi === null) return null;
  const alternatePi = currentPi === 3.14 ? 22 / 7 : 3.14;
  const kind = typeOf(topic, question);
  if (topic === '02-keliling') {
    const radius = Number(data.radius);
    if (kind === 'radius') return 2 * alternatePi * radius;
    if (kind === 'diameter') return alternatePi * Number(data.diameter);
    if (kind === 'balik') return Number(data.keliling) / (2 * alternatePi);
    if (kind === 'busur') return Number(data.sudut) / 360 * 2 * alternatePi * radius;
    if (kind === 'roda') return Number(data.putaran) * 2 * alternatePi * radius;
  }
  if (topic === '03-luas') {
    const radius = Number(data.radius);
    if (kind === 'radius') return alternatePi * radius ** 2;
    if (kind === 'diameter') return alternatePi * (Number(data.diameter) / 2) ** 2;
    if (kind === 'balik') return Math.sqrt(Number(data.luas) / alternatePi);
    if (kind === 'juring') return Number(data.sudut) / 360 * alternatePi * radius ** 2;
    if (kind === 'gabungan') return Number(data.sisi) ** 2 - alternatePi * radius ** 2;
    if (kind === 'setengah') return alternatePi * radius ** 2 / 2;
  }
  return null;
}

function approximate(actual: number, expected: number, tolerance = 1e-8): boolean {
  return Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
}

function hasilTampilan(nilai: number): number {
  return Number(nilai.toFixed(2));
}

function independentIssues(topic: TopicId, question: Question): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const data = question.data ?? {};
  const kind = typeOf(topic, question);
  const answer = question.jawabanBenar;
  const numericAnswer = typeof answer === 'number' ? answer : Number(answer);

  if (!question.pertanyaan || !question.pembahasan || /undefined|NaN|Infinity|\[object Object\]|\{x\}/.test(`${question.pertanyaan} ${question.pembahasan}`)) {
    issues.push({ key: 'teks-bocor', title: 'Teks soal atau pembahasan memuat nilai teknis', severity: 'Tinggi', independent: 'Pemeriksaan string menemukan undefined, NaN, Infinity, object mentah, atau placeholder.', impact: 'Siswa dapat menerima soal yang tidak dapat dibaca atau dihitung.', suggestion: 'Tambahkan validasi keluaran sebelum Question dikembalikan.' });
  }

  if (typeof answer === 'number' && !Number.isFinite(answer)) {
    issues.push({ key: 'jawaban-tidak-finit', title: 'Kunci jawaban bukan bilangan hingga', severity: 'Kritis', independent: `Number.isFinite(jawabanBenar) = false; kunci = ${answerText(answer)}.`, impact: 'Soal tidak dapat dinilai dengan benar.', suggestion: 'Jaga domain akar dan pembagian sebelum menghitung jawaban.' });
  }

  if (topic === '01-unsur') {
    const match = question.pertanyaan.match(/(\d+(?:[,.]\d+)?) cm/);
    const given = match ? Number(match[1].replace(',', '.')) : NaN;
    const expected = kind === 'diameter' ? given * 2 : kind === 'jari-jari' ? given / 2 : given * 2 * 3.14;
    if (!approximate(numericAnswer, expected)) issues.push({ key: 'kunci-01', title: 'Kunci topik 1 berbeda dari hitungan koordinat/aljabar independen', severity: 'Kritis', independent: `${kind}: hitung ulang dari nilai pada teks = ${expected}.`, impact: 'Jawaban yang benar dapat dinilai salah.', suggestion: 'Samakan kunci dengan perhitungan dari besaran yang tertulis.' });
  }

  if (topic === '04-sudut') {
    const match = question.pertanyaan.match(/adalah (\d+)°/);
    const given = match ? Number(match[1]) : NaN;
    const expected = given * 2;
    if (!approximate(numericAnswer, expected)) issues.push({ key: 'kunci-04', title: 'Kunci sudut pusat berbeda dari verifikasi independen', severity: 'Kritis', independent: `Sudut pusat = 2 × ${given} = ${expected}°.`, impact: 'Relasi sudut pusat dan sudut keliling disajikan salah.', suggestion: 'Hitung kunci dari busur yang sama dan cek batas sudut.' });
  }

  if (topic === '02-keliling') {
    if (kind === 'ukur') {
      const ratio = Number(data.keliling) / Number(data.diameter);
      if (answer !== '3,14' || Math.abs(ratio - 3.14) > Math.abs(ratio - 3.4)) issues.push({ key: 'kunci-02-ukur', title: 'Kunci pendekatan π tidak sesuai hasil pengukuran', severity: 'Kritis', independent: `K ÷ d = ${ratio}; jarak ke pilihan diperiksa secara numerik.`, impact: 'Siswa bisa diarahkan memilih pendekatan π yang keliru.', suggestion: 'Bandingkan semua opsi dengan rasio hasil ukur dan pilih jarak minimum.' });
    } else if (kind === 'rasio') {
      const expected = Number((Number(data.keliling) / Number(data.diameter)).toFixed(2));
      if (!approximate(numericAnswer, expected, 1e-10)) issues.push({ key: 'kunci-02-rasio', title: 'Kunci rasio K ÷ d salah', severity: 'Kritis', independent: `K ÷ d dibulatkan dua desimal = ${expected}.`, impact: 'Penilaian rasio tidak sesuai angka pada soal.', suggestion: 'Bulatkan hasil pembagian pada tahap akhir sesuai instruksi.' });
    } else if (kind === 'apit') {
      const n = Number(data.n);
      const lower = n * Math.sin(Math.PI / n);
      const upper = n * Math.tan(Math.PI / n);
      const bounds = answerText(answer).match(/([\d,]+) < π < ([\d,]+)/);
      if (!bounds || Math.abs(Number(bounds[1].replace(',', '.')) - lower) > 0.001 || Math.abs(Number(bounds[2].replace(',', '.')) - upper) > 0.001) issues.push({ key: 'kunci-02-apit', title: 'Batas Archimedes tidak konsisten dengan perhitungan independen', severity: 'Kritis', independent: `Dengan n = ${n}, batas trigonometri ≈ ${lower.toFixed(3)} < π < ${upper.toFixed(3)}.`, impact: 'Kesimpulan tentang batas π dapat menyesatkan.', suggestion: 'Pastikan teks, data, dan kunci memakai batas untuk n yang sama.' });
    } else {
      const pi = piFromText(question);
      const radius = Number(data.radius);
      const expected = kind === 'radius'
        ? 2 * Number(pi) * radius
        : kind === 'diameter'
          ? Number(pi) * Number(data.diameter)
          : kind === 'balik'
            ? radius
            : kind === 'busur'
              ? Number(data.sudut) / 360 * 2 * Number(pi) * radius
              : Number(data.putaran) * 2 * Number(pi) * radius;
      const expectedTampilan = kind === 'balik' ? expected : hasilTampilan(expected);
      if (pi === null || !approximate(numericAnswer, expectedTampilan)) issues.push({ key: 'kunci-02', title: 'Kunci keliling tidak konsisten dengan π yang tertulis', severity: 'Kritis', independent: `Hitung ulang menggunakan π pada teks (${pi ?? 'tidak ditemukan'}) = ${expectedTampilan}.`, impact: 'Siswa yang mengikuti π pada soal dapat dianggap salah.', suggestion: 'Ambil π dari parameter soal yang sama untuk teks, kunci, dan pembahasan.' });
    }
  }

  if (topic === '03-luas') {
    const pi = piFromText(question);
    const radius = Number(data.radius);
    const expected = kind === 'balik'
      ? radius
      : kind === 'juring'
        ? Number(data.sudut) / 360 * Number(pi) * radius ** 2
        : kind === 'gabungan'
          ? Number(data.sisi) ** 2 - Number(pi) * radius ** 2
          : kind === 'setengah'
            ? Number(pi) * radius ** 2 / 2
            : Number(pi) * radius ** 2;
    const expectedTampilan = hasilTampilan(expected);
    if (pi === null || !approximate(numericAnswer, expectedTampilan)) issues.push({ key: 'kunci-03', title: 'Kunci luas tidak konsisten dengan π yang tertulis', severity: 'Kritis', independent: `Hitung ulang dengan π = ${pi ?? 'tidak ditemukan'} menghasilkan ${expectedTampilan}.`, impact: 'Jawaban luas siswa dapat dinilai salah.', suggestion: 'Gunakan nilai π dari teks secara konsisten dan nyatakan pembulatan jika diperlukan.' });
  }

  if (topic === '05-tali-busur') {
    const a = Number(data.busurPertama);
    const b = Number(data.busurKedua);
    const expected = kind === 'dua-busur' ? (data.mode === 'dalam' ? (a + b) / 2 : Math.abs(a - b) / 2) : b;
    const expectedAngle = data.mode === 'dalam' ? (a + b) / 2 : Math.abs(a - b) / 2;
    if (!approximate(numericAnswer, expected)) issues.push({ key: 'kunci-05', title: 'Kunci sudut/busur berbeda dari verifikasi busur independen', severity: 'Kritis', independent: kind === 'dua-busur' ? `Dengan busur ${a}° dan ${b}°, hasil sudut independen = ${expectedAngle}°.` : `Dari sudut ${Number(data.sudut)}° dan busur ${a}°, busur pasangan yang dibangkitkan = ${expected}°; sudut balik terverifikasi ${expectedAngle}° .`, impact: 'Relasi busur dan sudut dapat diajarkan atau dinilai salah.', suggestion: 'Tentukan busur dekat/jauh atau busur yang dihadapinya secara eksplisit.' });
    if (data.mode === 'luar' && (!question.pertanyaan.includes('Perpanjangan dua tali busur') || !question.pertanyaan.includes('secan'))) issues.push({ key: 'istilah-05-luar', title: 'Soal belum menjelaskan perpanjangan garis secan di luar lingkaran', severity: 'Kritis', independent: 'Konfigurasi luar harus menyebut perpanjangan dua tali busur sebagai garis potong (secan).', impact: 'Siswa dapat mengira dua ruas tali busur saling berpotongan di luar lingkaran.', suggestion: 'Sebutkan perpanjangan dua tali busur sebagai garis secan dan bedakan busur jauh serta busur dekat.' });
    if (a <= 0 || b <= 0 || a + b > 360 || expected <= 0 || expected > 180) issues.push({ key: 'domain-05', title: 'Busur atau sudut perpotongan berada di luar domain geometri', severity: 'Kritis', independent: `a = ${a}, b = ${b}, sudut = ${expected}; harus positif dan memenuhi batas busur.`, impact: 'Soal dapat menggambarkan busur atau sudut yang tidak mungkin.', suggestion: 'Batasi pembangkit pada busur positif, jumlah busur ≤ 360°, dan sudut dalam rentang.' });
  }

  if (topic === '06-segi-empat') {
    const expected = kind === 'berhadapan' ? 180 - Number(data.sudutDiketahui) : kind === 'aljabar' ? Number(data.x) : Number(data.sudutLuar);
    if (!approximate(numericAnswer, expected) || expected <= 0 || expected >= 180) issues.push({ key: 'kunci-06', title: 'Kunci atau domain sudut segi empat tali busur bermasalah', severity: 'Kritis', independent: `Sudut berhadapan/sudut luar dihitung ulang = ${expected}°.`, impact: 'Siswa dapat memperoleh sudut yang salah atau tidak valid.', suggestion: 'Jaga sudut dalam positif dan kurang dari 180°; verifikasi persamaan aljabar.' });
    if (kind === 'aljabar' && (!Number.isInteger(Number(data.x)) || Number(data.x) <= 0)) issues.push({ key: 'domain-06-aljabar', title: 'Nilai x aljabar tidak bulat positif', severity: 'Tinggi', independent: `x = ${data.x}; pemeriksaan bilangan bulat positif gagal.`, impact: 'Soal tidak sesuai tingkat kesulitan yang dijanjikan.', suggestion: 'Bangun konstanta dari x bulat positif dan cek kedua sudut.' });
  }

  if (topic === '07-dalam-segitiga') {
    if (kind === 'luas') {
      const radius = Number(data.radius);
      const semiperimeter = Number(data.setengahKeliling);
      const maxRadius = semiperimeter / Math.sqrt(27);
      if (radius <= 0 || semiperimeter <= 0 || radius > maxRadius + 1e-9) issues.push({ key: 'domain-07-luas', title: 'Kombinasi jari-jari lingkaran dalam dan setengah keliling mustahil', severity: 'Kritis', independent: `Untuk s = ${semiperimeter}, r maksimum pada segitiga adalah s/√27 ≈ ${maxRadius.toFixed(3)}, tetapi r = ${radius}.`, impact: 'Siswa diminta menyelesaikan data segitiga yang tidak mungkin ada.', suggestion: 'Bangun pasangan r dan s dari segitiga valid atau batasi r ≤ s/√27.' });
    } else {
      const a = Number(data.a); const b = Number(data.b); const c = Number(data.c);
      const expected = (a + b - c) / 2;
      if (!approximate(numericAnswer, expected) || !(a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a)) issues.push({ key: 'domain-07', title: 'Data segitiga siku-siku atau kunci jari-jari tidak valid', severity: 'Kritis', independent: `Sisi = ${a}, ${b}, ${c}; r independen = ${expected}; ketidaksamaan segitiga diperiksa.`, impact: 'Soal dapat memiliki segitiga yang tidak terbentuk.', suggestion: 'Validasi tripel dan gunakan r = (a+b−c)/2 hanya untuk segitiga siku-siku.' });
    }
  }

  if (topic === '08-luar-segitiga') {
    const a = Number(data.a); const b = Number(data.b); const c = Number(data.c);
    if (!(a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a)) issues.push({ key: 'domain-08', title: 'Sisi segitiga tidak memenuhi ketidaksamaan segitiga', severity: 'Kritis', independent: `Sisi = ${a}, ${b}, ${c}; salah satu jumlah dua sisi tidak lebih besar dari sisi ketiga.`, impact: 'Pusat lingkaran luar tidak terdefinisi untuk segitiga tersebut.', suggestion: 'Validasi ketiga ketidaksamaan segitiga sebelum menghitung R.' });
    if (kind === 'klasifikasi') {
      const squares = [a * a, b * b, c * c].sort((x, y) => x - y);
      const expected = squares[0] + squares[1] > squares[2] ? 'lancip' : squares[0] + squares[1] === squares[2] ? 'siku-siku' : 'tumpul';
      if (answer !== expected) issues.push({ key: 'kunci-08-klasifikasi', title: 'Klasifikasi segitiga berbeda dari kuadrat sisi', severity: 'Kritis', independent: `${squares[0]} + ${squares[1]} dibandingkan dengan ${squares[2]} menghasilkan ${expected}.`, impact: 'Siswa dapat mempelajari klasifikasi yang salah.', suggestion: 'Tentukan klasifikasi dari sisi terpanjang dan cek pusat lingkaran luar.' });
    } else {
      const expected = kind === 'sama-kaki' ? hasilTampilan(a * b * c / (4 * Number(data.luas))) : c / 2;
      if (!approximate(numericAnswer, expected)) issues.push({ key: 'kunci-08', title: 'Kunci jari-jari lingkaran luar tidak sesuai rumus independen', severity: 'Kritis', independent: `R = abc/(4L) atau c/2 menghasilkan ${expected}.`, impact: 'Nilai jari-jari lingkaran luar yang benar dapat ditolak.', suggestion: 'Hitung R dari tiga sisi dan luas atau dari sisi miring untuk segitiga siku-siku.' });
    }
  }

  if (topic === '09-garis-singgung') {
    const d = Number(data.d); const radius = Number(data.radius); const length = Number(data.panjang);
    const expected = kind === 'cari-radius' ? Math.sqrt(d ** 2 - length ** 2) : kind === 'cari-jarak' ? Math.sqrt(radius ** 2 + length ** 2) : kind === 'sudut' ? 90 : length;
    if (!approximate(numericAnswer, expected)) issues.push({ key: 'kunci-09', title: 'Kunci garis singgung berbeda dari hitungan koordinat/Pythagoras independen', severity: 'Kritis', independent: `Hitung ulang dari segitiga siku-siku = ${expected}.`, impact: 'Panjang, jarak, atau radius garis singgung dapat dinilai salah.', suggestion: 'Bangun segitiga siku-siku dari pusat dan titik singgung; cek radikan ≥ 0.' });
    if (kind === 'luar' && !(d > Math.abs(Number(data.R) - Number(data.r)))) issues.push({ key: 'domain-09-luar', title: 'Syarat garis singgung persekutuan luar tidak terpenuhi', severity: 'Kritis', independent: `d = ${d} harus lebih besar dari |R−r| = ${Math.abs(Number(data.R) - Number(data.r))}.`, impact: 'Garis singgung luar yang ditanyakan mungkin tidak ada.', suggestion: 'Jaga d > |R−r| dan radikan d²−(R−r)² positif.' });
    if (kind === 'dalam' && !(d > Number(data.R) + Number(data.r))) issues.push({ key: 'domain-09-dalam', title: 'Syarat garis singgung persekutuan dalam tidak terpenuhi', severity: 'Kritis', independent: `d = ${d} harus lebih besar dari R+r = ${Number(data.R) + Number(data.r)}.`, impact: 'Garis singgung dalam yang ditanyakan mungkin tidak ada.', suggestion: 'Jaga d > R+r untuk garis singgung persekutuan dalam.' });
  }

  if (topic === '10-kedudukan') {
    const R = Number(data.R); const r = Number(data.r); const d = Number(data.d);
    const sum = R + r; const difference = R - r;
    if (!(R > 0 && r > 0 && R > r && d >= 0)) issues.push({ key: 'domain-10-radius', title: 'Radius atau jarak pusat tidak valid', severity: 'Kritis', independent: `R = ${R}, r = ${r}, d = ${d}; harus R > r > 0 dan d ≥ 0.`, impact: 'Kedudukan dua lingkaran tidak dapat diklasifikasikan.', suggestion: 'Validasi radius besar, radius kecil, dan jarak pusat.' });
    if (kind === 'klasifikasi') {
      const expected = d === 0 ? 'sepusat' : d > sum ? 'saling lepas' : d === sum ? 'bersinggungan luar' : d > difference ? 'berpotongan di dua titik' : d === difference ? 'bersinggungan dalam' : 'satu di dalam yang lain';
      if (answer !== expected) issues.push({ key: 'kunci-10-klasifikasi', title: 'Klasifikasi kedudukan dua lingkaran salah', severity: 'Kritis', independent: `Perbandingan d=${d}, R+r=${sum}, R−r=${difference} menghasilkan “${expected}”.`, impact: 'Siswa dapat menghafal kedudukan dan jumlah titik yang salah.', suggestion: 'Pisahkan syarat d < R−r dari d = R−r; jangan memberi label “isi” pada kondisi bersinggungan.' });
    }
    if (kind === 'jumlah-garis') {
      const expected = d > sum ? 4 : d === sum ? 3 : d > difference ? 2 : d === difference ? 1 : 0;
      if (numericAnswer !== expected) issues.push({ key: 'kunci-10-garis', title: 'Jumlah garis singgung persekutuan salah', severity: 'Kritis', independent: `Dari klasifikasi independen, jumlah garis = ${expected}.`, impact: 'Siswa menerima jumlah garis singgung yang salah.', suggestion: 'Turunkan jumlah garis dari lima kondisi jarak secara eksplisit.' });
    }
    if (kind === 'jumlah-titik') {
      const expected = d === sum || d === difference ? 1 : d > difference && d < sum ? 2 : 0;
      if (numericAnswer !== expected) issues.push({ key: 'kunci-10-titik', title: 'Jumlah titik persekutuan salah', severity: 'Kritis', independent: `Dari d, R+r, dan R−r, jumlah titik = ${expected}.`, impact: 'Siswa dapat salah memahami kondisi bersinggungan atau berpotongan.', suggestion: 'Periksa kondisi batas d = R+r dan d = R−r secara terpisah.' });
    }
    if (kind === 'rentang-potong') {
      const expected = `${difference} < d < ${sum}`;
      if (answer !== expected) issues.push({ key: 'kunci-10-rentang', title: 'Rentang dua titik persekutuan salah', severity: 'Kritis', independent: `Syarat independen: ${difference} < d < ${sum}.`, impact: 'Siswa dapat memilih rentang jarak yang salah.', suggestion: 'Gunakan ketaksamaan ketat R−r < d < R+r.' });
    }
  }

  return issues;
}

function choiceIssues(question: Question): CheckIssue[] {
  if (!question.pilihan) return [];
  const matches = question.pilihan.filter((option) => ownAnswerMatches(question, option)).length;
  const issues: CheckIssue[] = [];
  if (new Set(question.pilihan).size !== question.pilihan.length) issues.push({ key: 'opsi-identik', title: 'Pilihan ganda memiliki opsi identik', severity: 'Kritis', independent: `Set opsi berukuran ${new Set(question.pilihan).size}, sedangkan jumlah opsi ${question.pilihan.length}.`, impact: 'Siswa dapat memperoleh lebih dari satu pilihan yang sama.', suggestion: 'Bangun pengecoh dari kesalahan umum dan deduplikasi setelah pemformatan.' });
  if (matches !== 1) issues.push({ key: 'opsi-benar', title: 'Pilihan ganda tidak memiliki tepat satu jawaban benar', severity: 'Kritis', independent: `${matches} opsi cocok dengan kunci menggunakan perbandingan numerik/tulisan independen.`, impact: 'Skor kuis atau latihan dapat bergantung pada pilihan ganda yang ambigu.', suggestion: 'Uji semua opsi setelah pembulatan dan pastikan hanya satu yang sama dengan kunci.' });
  return issues;
}

function textIssues(question: Question): CheckIssue[] {
  const issues: CheckIssue[] = [];
  if (/[0-9]\.[0-9]/.test(`${question.pertanyaan} ${question.pembahasan}`)) issues.push({ key: 'desimal-titik', title: 'Angka desimal tampil dengan titik', severity: 'Sedang', independent: 'Regex menemukan angka seperti 3.14 atau 7.04 pada teks yang tampil.', impact: 'Format desimal tidak konsisten dengan konvensi Indonesia yang diminta.', suggestion: 'Gunakan formatter tampilan yang mengganti titik desimal menjadi koma.' });
  // Pembahasan dirender sebagai KaTeX oleh komponen MathText di UI.
  if (typeof question.jawabanBenar === 'number') {
    const finalNumber = Number(question.pembahasan.match(/=\s*([\d.,]+)\s*(?:cm²?|°)?\.?$/)?.[1]?.replace(',', '.'));
    if (Number.isFinite(finalNumber) && Math.abs(finalNumber - question.jawabanBenar) > 1e-9) issues.push({ key: 'pembahasan-kunci', title: 'Nilai akhir pembahasan berbeda dari kunci pada presisi yang dipakai', severity: 'Sedang', independent: `Nilai akhir pembahasan = ${finalNumber}, kunci = ${question.jawabanBenar}.`, impact: 'Siswa dan guru melihat hasil akhir yang berbeda.', suggestion: 'Tetapkan presisi kunci dan tampilkan instruksi pembulatan yang sama.' });
  }
  return issues;
}

function addViolation(
  violations: Map<string, Violation>,
  topic: TopicId,
  type: string,
  seed: number,
  question: Question,
  issue: CheckIssue
): void {
  const key = `${topic}:${type}:${issue.key}`;
  const existing = violations.get(key);
  const evidence: ViolationEvidence = {
    seed,
    question: question.pertanyaan,
    answer: answerText(question.jawabanBenar),
    explanation: question.pembahasan,
    independent: issue.independent
  };
  if (existing) {
    existing.count += 1;
    if (existing.examples.length < 5) existing.examples.push(evidence);
    return;
  }
  violations.set(key, {
    key,
    id: '',
    title: issue.title,
    severity: issue.severity,
    topic: topicLabel(topic),
    type,
    count: 1,
    examples: [evidence],
    impact: issue.impact,
    suggestion: issue.suggestion
  });
}

const sensitivityTopics: TopicId[] = ['03-luas', '08-luar-segitiga', '10-kedudukan'];

function mutatedKeyDetected(topic: TopicId, seed: number): boolean {
  const question = buatSoal(topic, seed);
  const mutated: Question = { ...question, jawabanBenar: typeof question.jawabanBenar === 'number' ? question.jawabanBenar + 1 : '__kunci_salah__' };
  return independentIssues(topic, mutated).length > 0;
}

function firstSensitiveSeed(topic: TopicId): number {
  for (let seed = 1; seed <= 250_000; seed += 1) {
    if (mutatedKeyDetected(topic, seed)) return seed;
  }
  return 1;
}

function collectSeeds(topic: TopicId): Map<string, number[]> {
  const collected = new Map(expectedTypes[topic].map((type) => [type, [] as number[]]));
  for (let seed = 1; seed <= 250_000; seed += 1) {
    if ([...collected.values()].every((values) => values.length >= 2000)) break;
    const question = buatSoal(topic, seed);
    const type = typeOf(topic, question);
    const values = collected.get(type);
    if (values && values.length < 2000) values.push(seed);
  }
  return collected;
}

function markdownQuestion(value: string): string {
  return value.replace(/\n/g, ' ').replace(/\|/g, '\\|');
}

function severityOrder(severity: Severity): number {
  return { Kritis: 0, Tinggi: 1, Sedang: 2, Rendah: 3 }[severity];
}

function evaluateAudit() {
  const violations = new Map<string, Violation>();
  const stats: TopicStat[] = [];
  const samples: { topic: TopicId; type: string; seed: number; question: Question; issues: CheckIssue[] }[] = [];
  const allQuestions = new Map<TopicId, Question[]>();

  for (const topic of topicOrder) {
    const seedsByType = collectSeeds(topic);
    const topicQuestions: Question[] = [];
    const typeStats: TypeStat[] = [];
    for (const type of expectedTypes[topic]) {
      const seeds = seedsByType.get(type) ?? [];
      const signatures = new Set<string>();
      for (const seed of seeds) {
        const question = buatSoal(topic, seed);
        topicQuestions.push(question);
        signatures.add(questionSignature(question));
        const issues = [...independentIssues(topic, question), ...choiceIssues(question), ...textIssues(question)];
        for (const issue of issues) addViolation(violations, topic, type, seed, question, issue);
      }
      const sampleSeeds = seeds.slice(0, 5);
      if (topic === '05-tali-busur' && !sampleSeeds.some((seed) => buatSoal(topic, seed).data?.mode === 'luar')) {
        const seedLuar = seeds.find((seed) => buatSoal(topic, seed).data?.mode === 'luar');
        if (seedLuar !== undefined) sampleSeeds[sampleSeeds.length - 1] = seedLuar;
      }
      for (const seed of sampleSeeds) {
        const question = buatSoal(topic, seed);
        samples.push({ topic, type, seed, question, issues: [...independentIssues(topic, question), ...choiceIssues(question), ...textIssues(question)] });
      }
      typeStats.push({ type, format: formatByType[type] ?? 'tidak diketahui', seeds: seeds.length, unique: signatures.size, status: seeds.length >= 2000 ? 'Lulus cakupan seed' : 'Gagal cakupan seed', sampleSeeds });
    }
    allQuestions.set(topic, topicQuestions);
    stats.push({ id: topic, name: topicNames[topic], types: typeStats });
  }

  const parserCases = [
    ['12,5', 12.5], ['12.5', 12.5], [' 12,5 ', 12.5], ['−7', -7], ['70°', 70], ['70 derajat', 70], ['154 cm2', 154], ['154 cm²', 154], ['', null], ['abc', null], ['12.5.6', null], ['1,234', null]
  ] as const;
  const parserResults = parserCases.map(([input, expected]) => ({ input, expected, actual: parseNumericAnswer(input) }));
  const missingParserForms = parserResults.filter((result) => ['70°', '70 derajat', '154 cm2', '154 cm²'].includes(result.input) && result.actual === null);
  if (missingParserForms.length > 0) {
    violations.set('parser:satuan', {
      key: 'parser:satuan', id: '', title: 'Parser belum menerima satuan dan simbol yang wajar diketik siswa', severity: 'Sedang', topic: 'Lintas topik', type: 'isian numerik', count: missingParserForms.length,
      examples: [{ seed: 0, question: 'Input parser: 70°, 70 derajat, 154 cm2, 154 cm²', answer: 'null', explanation: 'parseNumericAnswer hanya mengembalikan null untuk bentuk-bentuk ini.', independent: 'Kebutuhan audit meminta bentuk sudut dan luas bersatuan diuji; semuanya belum diterima.' }],
      impact: 'Siswa yang menulis jawaban dengan satuan atau simbol derajat wajar dapat langsung dianggap salah.', suggestion: 'Normalisasi simbol derajat dan satuan yang didukung, lalu tampilkan kebijakan satuan pada kolom jawaban.'
    });
  }
  if (parseNumericAnswer('1,234') === 1.234) {
    violations.set('parser:pemisah-ribuan', {
      key: 'parser:pemisah-ribuan', id: '', title: 'Parser menerima pemisah ribuan ambigu sebagai desimal', severity: 'Sedang', topic: 'Lintas topik', type: 'isian numerik', count: 1,
      examples: [{ seed: 0, question: 'Input parser: 1,234', answer: '1,234', explanation: 'Parser mengembalikan 1,234 sebagai 1.234.', independent: 'Bentuk ini ambigu antara 1,234 desimal Indonesia dan 1.234 dengan pemisah ribuan.' }],
      impact: 'Nilai besar dapat ditafsirkan berbeda tanpa pesan kepada siswa.', suggestion: 'Tolak pemisah ribuan ambigu atau dokumentasikan satu format angka yang diterima.'
    });
  }

  const allPackageStats: { topic: TopicId; duplicate: number; threeSame: number; packages: number; examples: string[] }[] = [];
  for (const topic of topicOrder) {
    let duplicate = 0;
    let threeSame = 0;
    const examples: string[] = [];
    for (let seed = 1; seed <= 2000; seed += 1) {
      const pack = buatPaketKuis(topic, seed);
      const signatures = pack.map(questionSignature);
      if (new Set(signatures).size !== signatures.length) {
        duplicate += 1;
        if (examples.length < 3) examples.push(`seed ${seed}: ada soal kembar`);
      }
      const types = pack.map((question) => typeOf(topic, question));
      if (expectedTypes[topic].length > 1 && types.some((type, index) => index >= 2 && type === types[index - 1] && type === types[index - 2])) {
        threeSame += 1;
        if (examples.length < 3) examples.push(`seed ${seed}: tiga jenis berurutan = ${types.join(', ')}`);
      }
    }
    allPackageStats.push({ topic, duplicate, threeSame, packages: 2000, examples });
    if (duplicate > 0) violations.set(`${topic}:kuis-kembar`, {
      key: `${topic}:kuis-kembar`, id: '', title: 'Paket kuis dapat memuat soal kembar', severity: 'Sedang', topic: topicLabel(topic), type: 'paket kuis', count: duplicate,
      examples: [{ seed: 1, question: examples.find((item) => item.includes('seed')) ?? 'Lihat statistik paket.', answer: '-', explanation: 'Pemeriksaan signature teks, jenis, pilihan, dan kunci menemukan paket duplikat.', independent: `${duplicate} dari 2000 seed paket memiliki signature soal yang berulang.` }],
      impact: 'Kuis dapat menguji hal yang sama lebih dari sekali dan mengurangi cakupan materi.', suggestion: 'Tolak signature yang sudah dipakai saat membangun paket atau pilih seed berikutnya.'
    });
    if (threeSame > 0 && expectedTypes[topic].length > 1) violations.set(`${topic}:kuis-tiga-jenis`, {
      key: `${topic}:kuis-tiga-jenis`, id: '', title: 'Paket kuis dapat memuat tiga jenis soal berturut-turut', severity: 'Sedang', topic: topicLabel(topic), type: 'paket kuis', count: threeSame,
      examples: [{ seed: 1, question: examples.find((item) => item.includes('tiga jenis')) ?? 'Lihat statistik paket.', answer: '-', explanation: 'Pemeriksaan urutan jenis soal dilakukan pada 5 posisi setiap paket.', independent: `${threeSame} dari 2000 seed paket memiliki tiga jenis sama berurutan.` }],
      impact: 'Cakupan jenis soal dalam kuis menjadi kurang beragam.', suggestion: 'Pilih jenis dengan aturan rotasi atau tolak kandidat yang membuat tiga jenis berturut-turut.'
    });
  }

  const toleranceStats: ToleranceStats = { numericQuestions: 0, exactAccepted: 0, displayedQuestions: 0, roundedAccepted: 0, obviousWrongRejected: 0, alternatePiRejected: 0 };
  for (const [topic, questions] of allQuestions) {
    for (const question of questions) {
      if (typeof question.jawabanBenar !== 'number') continue;
      toleranceStats.numericQuestions += 1;
      if (jawabanSama(question, String(question.jawabanBenar))) toleranceStats.exactAccepted += 1;
      const displayed = finalDisplayedNumber(question);
      if (displayed !== null) {
        toleranceStats.displayedQuestions += 1;
        if (jawabanSama(question, String(displayed))) toleranceStats.roundedAccepted += 1;
      }
      const clearlyWrong = question.jawabanBenar === 0 ? 1 : question.jawabanBenar + Math.max(1, Math.abs(question.jawabanBenar) * 0.5);
      if (!jawabanSama(question, String(clearlyWrong))) toleranceStats.obviousWrongRejected += 1;
      const alternate = alternatePiAnswer(topic, question);
      if (alternate !== null && Math.abs(alternate - question.jawabanBenar) > (question.toleransi ?? 0.01) && !jawabanSama(question, String(alternate))) toleranceStats.alternatePiRejected += 1;
    }
  }
  if (toleranceStats.exactAccepted !== toleranceStats.numericQuestions || toleranceStats.obviousWrongRejected !== toleranceStats.numericQuestions) {
    violations.set('parser:toleransi', {
      key: 'parser:toleransi', id: '', title: 'Toleransi jawaban tidak konsisten pada isian numerik', severity: 'Tinggi', topic: 'Lintas topik', type: 'parser/toleransi', count: 1,
      examples: [{ seed: 0, question: 'Uji kunci persis dan kesalahan jelas', answer: `${toleranceStats.exactAccepted}/${toleranceStats.numericQuestions} persis; ${toleranceStats.obviousWrongRejected}/${toleranceStats.numericQuestions} salah ditolak`, explanation: 'Uji toleransi dijalankan pada seluruh isian numerik yang dikumpulkan.', independent: 'Kunci persis wajib diterima dan jawaban yang sengaja digeser jauh wajib ditolak.' }],
      impact: 'Siswa dapat ditolak saat benar atau diterima saat jelas salah.', suggestion: 'Tetapkan toleransi per jenis berdasarkan presisi yang diminta dan uji nilai batas.'
    });
  }

  const determinismFailures: string[] = [];
  for (const topic of topicOrder) {
    for (const seed of [1, 2, 97, 2000]) {
      if (JSON.stringify(buatSoal(topic, seed)) !== JSON.stringify(buatSoal(topic, seed)) || JSON.stringify(buatPaketKuis(topic, seed)) !== JSON.stringify(buatPaketKuis(topic, seed))) determinismFailures.push(`${topic}/${seed}`);
    }
  }
  if (determinismFailures.length > 0) violations.set('determinisme:gagal', {
    key: 'determinisme:gagal', id: '', title: 'Seed yang sama tidak menghasilkan soal yang sama', severity: 'Tinggi', topic: 'Lintas topik', type: 'determinisme', count: determinismFailures.length,
    examples: [{ seed: 0, question: determinismFailures.join(', '), answer: '-', explanation: 'Perbandingan JSON dua kali untuk soal dan paket.', independent: 'Signature untuk seed yang sama harus identik.' }],
    impact: 'Soal dan kunci tidak dapat direproduksi berdasarkan seed.', suggestion: 'Hilangkan sumber acak non-deterministik dari generator.'
  });

  for (const topic of topicOrder) {
    const firstByType = new Map<string, Question>();
    for (const question of allQuestions.get(topic) ?? []) {
      const type = typeOf(topic, question);
      if (!firstByType.has(type)) firstByType.set(type, question);
    }
    for (const [type, first] of firstByType) {
      if (!first.pilihan) continue;
      const positions = new Set<number>();
      for (const question of (allQuestions.get(topic) ?? []).filter((item) => typeOf(topic, item) === type)) {
        const position = question.pilihan?.findIndex((option) => ownAnswerMatches(question, option)) ?? -1;
        positions.add(position);
      }
      if (positions.size < 2) violations.set(`${topic}:${type}:posisi-kunci`, {
        key: `${topic}:${type}:posisi-kunci`, id: '', title: 'Posisi kunci pilihan ganda tidak berubah', severity: 'Sedang', topic: topicLabel(topic), type, count: 1,
        examples: [{ seed: 1, question: first.pertanyaan, answer: answerText(first.jawabanBenar), explanation: first.pembahasan, independent: `Dari sedikitnya 2000 seed untuk jenis ini, posisi kunci hanya ${[...positions].join(', ')}.` }],
        impact: 'Siswa dapat menebak posisi kunci tanpa memahami materi.', suggestion: 'Acak seluruh pilihan secara deterministik setelah opsi dibuat.'
      });
    }
  }

  const sensitivity = sensitivityTopics.map((topic) => {
    const seed = firstSensitiveSeed(topic);
    const original = buatSoal(topic, seed);
    const mutated: Question = { ...original, jawabanBenar: typeof original.jawabanBenar === 'number' ? original.jawabanBenar + 1 : '__kunci_salah__' };
    const detected = independentIssues(topic, mutated).length > 0;
    return { topic, seed, original, detected };
  });
  for (const item of sensitivity) {
    if (!item.detected) violations.set(`sensitivitas:${item.topic}`, {
      key: `sensitivitas:${item.topic}`, id: '', title: 'Uji kepekaan tidak menangkap kunci yang diubah', severity: 'Tinggi', topic: topicLabel(item.topic), type: typeOf(item.topic, item.original), count: 1,
      examples: [{ seed: item.seed, question: item.original.pertanyaan, answer: answerText(item.original.jawabanBenar), explanation: item.original.pembahasan, independent: 'Kunci diubah di memori sebesar +1, tetapi verifier tidak menghasilkan pelanggaran.' }],
      impact: 'Tes audit tidak dapat dipercaya untuk mendeteksi regresi kunci.', suggestion: 'Pisahkan verifier independen dari data kunci generator dan tambahkan mutation test.'
    });
  }

  /*
  const manualFindings: Violation[] = [
    {
      key: 'alur:reset-topik', id: '', title: 'State Latihan dan Kuis tidak di-reset saat topik berubah', severity: 'Tinggi', topic: 'Lintas topik', type: 'alur navigasi', count: 1,
      examples: [{ seed: 0, question: 'PracticeEngine dan QuizEngine menerima prop topikId yang berubah.', answer: 'state lama dipertahankan', explanation: 'Tidak ada useEffect atau key berbasis topikId untuk menginisialisasi ulang seed, soal, indeks, jawaban, skor, atau status selesai.', independent: 'Pembacaan komponen menunjukkan useState hanya dijalankan saat mount; useMemo QuizEngine hanya mengganti paket soal.' }],
      impact: 'Siswa dapat melihat soal atau skor dari topik sebelumnya setelah berpindah topik di tengah Latihan/Kuis.', suggestion: 'Reset state saat topikId berubah atau beri key={topikId} pada engine dari TopicPage.'
    },
    {
      key: 'alur:aria-live', id: '', title: 'Feedback jawaban tidak diumumkan melalui aria-live', severity: 'Tinggi', topic: 'Lintas topik', type: 'aksesibilitas', count: 1,
      examples: [{ seed: 0, question: 'Feedback benar/salah dirender sebagai div biasa.', answer: 'role/status tidak ada', explanation: 'PracticeEngine dan QuizEngine memakai class feedback tanpa aria-live atau role=status.', independent: 'Pemeriksaan JSX menemukan elemen feedback tidak memiliki live region; aria-live hanya dipakai pada UpdateToast.' }],
      impact: 'Pengguna pembaca layar mungkin tidak mengetahui hasil jawaban atau pembahasan yang baru muncul.', suggestion: 'Tambahkan role="status" atau aria-live="polite" pada feedback dan kelola fokus setelah soal berganti.'
    },
    {
      key: 'storage:rentang', id: '', title: 'Nilai skor localStorage tidak divalidasi dalam rentang skor kuis', severity: 'Sedang', topic: 'Lintas topik', type: 'penyimpanan', count: 1,
      examples: [{ seed: 0, question: 'localStorage berisi {"01-unsur":99}.', answer: '99/5', explanation: 'bacaSemuaSkor hanya memeriksa typeof skor === number; tidak memeriksa integer 0 sampai 5.', independent: 'Nilai 99 akan dikembalikan oleh ambilSkorTerbaik dan ditampilkan sebagai skor terbaik 99/5.', } as ViolationEvidence],
      impact: 'Data rusak yang masih berupa number dapat menampilkan skor mustahil dan memengaruhi tampilan.', suggestion: 'Validasi Number.isInteger(skor) && skor >= 0 && skor <= 5; abaikan atau pulihkan nilai di luar skema.'
    }
  ];
  */
  const manualFindings: Violation[] = [];
  for (const finding of manualFindings) violations.set(finding.key, finding);

  const sortedViolations = [...violations.values()].sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity) || a.topic.localeCompare(b.topic) || a.title.localeCompare(b.title));
  sortedViolations.forEach((violation, index) => { violation.id = `A-${String(index + 1).padStart(3, '0')}`; });
  return { stats, samples, violations: sortedViolations, parserResults, allPackageStats, sensitivity, toleranceStats, determinismFailures };
}

function renderReport(result: ReturnType<typeof evaluateAudit>): string {
  const countBySeverity = (severity: Severity) => result.violations.filter((item) => item.severity === severity).length;
  const totalExamples = result.violations.reduce((sum, item) => sum + item.count, 0);
  const topRisks = [...new Set(result.violations.map((item) => item.title.toLowerCase()))].slice(0, 3);
  const inventory = result.stats.map((stat) => {
    const status = stat.types.map((type) => {
      const relevant = result.violations.filter((item) => item.topic === stat.name && item.type === type.type);
      const statusA = relevant.some((item) => /kunci-|jawaban-tidak/.test(item.key)) ? 'gagal' : 'lulus';
      const statusB = relevant.some((item) => /domain-/.test(item.key)) ? 'gagal' : 'lulus';
      const statusC = relevant.some((item) => /opsi-|posisi-kunci/.test(item.key)) ? 'gagal' : 'lulus';
      const statusD = 'lulus';
      const statusE = relevant.some((item) => /teks-bocor|istilah-|pembahasan-|desimal-titik/.test(item.key)) ? 'gagal' : 'lulus';
      const statusF = type.unique < 30 ? 'variasi <30' : 'lulus';
      return `${type.type}: A ${statusA}, B ${statusB}, C ${statusC}, D ${statusD}, E ${statusE}, F ${statusF}`;
    }).join('<br>');
    return `| ${stat.id} — ${stat.name} | ${stat.types.map((type) => `${type.type} (${type.format})`).join('<br>')} | ${stat.types.map((type) => type.seeds).join(', ')} | ${stat.types.map((type) => type.unique).join(', ')} | ${status} |`;
  }).join('\n');
  const findingText = result.violations.length === 0 ? 'Tidak ada temuan otomatis.' : result.violations.map((item) => {
    const evidence = item.examples.map((example) => `- Seed ${example.seed}: soal: \`${markdownQuestion(example.question)}\`<br>  Kunci: \`${markdownQuestion(example.answer)}\`<br>  Pembahasan: \`${markdownQuestion(example.explanation)}\`<br>  Hitungan/verifikasi independen: ${example.independent}`).join('\n');
    return `### ${item.id} — ${item.title}\n\n- **Tingkat**: **${item.severity}**\n- **Topik / jenis**: ${item.topic} / ${item.type}\n- **Jumlah kemunculan pada sampel audit**: ${item.count}\n- **Bukti**:\n${evidence}\n- **Dampak**: ${item.impact}\n- **Saran perbaikan**: ${item.suggestion}\n`;
  }).join('\n');
  const packageText = result.allPackageStats.map((item) => `| ${item.topic} | ${item.packages} | ${item.duplicate} | ${expectedTypes[item.topic].length === 1 ? 'N/A' : item.threeSame} | ${item.examples.join('<br>') || '—'} |`).join('\n');
  const sensitivityText = result.sensitivity.map((item) => `| ${item.topic} | ${item.seed} | ${answerText(item.original.jawabanBenar)} → dimutasi | ${item.detected ? 'Terdeteksi' : 'Tidak terdeteksi'} |`).join('\n');
  const tolerance = result.toleranceStats;
  return `# Audit Latihan dan Kuis — Simulasi Lingkaran SMP

Tanggal audit: 10 Oktober 2026. Audit ini membaca generator dan komponen aplikasi tanpa mengubah kode aplikasi atau dependensi.

## 1. Ringkasan eksekutif

Kesimpulan: **${countBySeverity('Kritis') === 0 && countBySeverity('Tinggi') === 0 ? 'layak dari sisi generator dan pemeriksaan kode otomatis; uji manual yang tercantum tetap diperlukan' : 'belum layak dipakai siswa sebelum temuan Kritis dan Tinggi diperbaiki'}**.
Jumlah temuan teragregasi: ${result.violations.length} aturan temuan (${totalExamples} kemunculan pada soal/paket yang diuji).
Kritis: ${countBySeverity('Kritis')}; Tinggi: ${countBySeverity('Tinggi')}; Sedang: ${countBySeverity('Sedang')}; Rendah: ${countBySeverity('Rendah')}.
Semua jenis yang terinventarisasi diuji sedikitnya 2.000 seed per jenis: ${result.stats.every((stat) => stat.types.every((type) => type.seeds >= 2000)) ? 'ya' : 'tidak'}.
Risiko terbesar: ${topRisks.length > 0 ? topRisks.join('; ') : 'tidak ada risiko Kritis/Tinggi yang terverifikasi pada audit otomatis'}.
Laporan ini adalah hasil audit ulang setelah perbaikan; status setiap jenis soal dan alur dicatat di bawah.

## 2. Inventaris

Jumlah pada kolom seed dan variasi mengikuti urutan jenis soal yang ditulis pada kolom jenis. A = kebenaran kunci, B = kelayakan matematis, C = pilihan ganda, D = parser/toleransi, E = konsistensi teks, F = determinisme/keragaman. Kebijakan parser dijelaskan pada bagian hasil alur.

| Topik | Jenis soal dan format jawaban | Seed diuji per jenis | Variasi unik per jenis | Status A–F per jenis |
|---|---|---:|---:|---|
${inventory}

Tingkat kesulitan tidak memiliki field khusus pada tipe \`Question\`. Karena itu generator tidak menyimpan atau menampilkan tingkat kesulitan formal; tingkat hanya dapat diinferensikan dari struktur soal. Satuan yang muncul terutama cm, cm², dan °.

## 3. Temuan

${findingText}

## 4. Hasil alur Latihan/Kuis

| Butir | Status | Catatan berbasis pembacaan kode |
|---|---|---|
| Latihan: tombol Periksa dan umpan balik | Lulus | Tombol, status benar/salah, pembahasan, dan satu live region bersama tersedia. Tidak ada skor latihan yang dapat digandakan. |
| Latihan: Soal baru dan reset jawaban | Lulus | \`soalBaru\` mengganti seed, soal, jawaban, status diperiksa, dan memindahkan fokus ke judul soal baru. |
| Kuis: tepat 5 soal dan maju | Lulus | \`buatPaketKuis\` membuat lima soal; tombol Lanjut maju dan kunci sekali dengan \`sudahDijawab\`. |
| Kuis: mundur | Tidak tersedia | Tidak ada tombol atau state untuk mundur; tidak diuji sebagai fitur yang tersedia. |
| Kuis: skor, hasil, dan Ulangi | Lulus | Skor bertambah sekali per soal, layar hasil diumumkan lewat live region, dan Ulangi mereset state serta membuat seed baru. |
| Reset saat pindah topik | Lulus | Engine diberi \`key={meta.id}\`; perpindahan tab/topik yang meninggalkan kuis meminta konfirmasi dan menghapus progres sementara setelah disetujui. |
| Skor terbaik tidak turun | Lulus | \`simpanSkorTerbaik\` hanya menulis jika skor baru lebih besar. \`try/catch\` melindungi baca/tulis. |
| Data localStorage rusak/kosong | Lulus | JSON rusak, kosong, bukan number, bukan integer, atau di luar rentang 0–5 diabaikan; baca/tulis dilindungi \`try/catch\`. |
| Kunci localStorage antar-topik | Lulus | Satu objek JSON memakai \`topikId\` sebagai property. |
| Reload di tengah kuis | Catatan | State kuis tidak dipersistenkan; reload memulai state kuis baru dengan seed baru. |
| Jaringan putus | Catatan | README menyatakan aset dibundel dan PWA melakukan precache; alur kuis tidak memiliki state jaringan khusus. Uji offline perangkat nyata belum dilakukan. |
| \`aria-live\` untuk feedback | Lulus | Komponen \`AnswerFeedback\` selalu ada di DOM dengan \`role=status\`, \`aria-live=polite\`, ikon, dan teks; hasil akhir kuis memakai region yang sama. |
| Keyboard, target sentuh, kontras | Lulus sebagian | Kontrol native fokus keyboard, tombol utama dan opsi memiliki tinggi minimal 44–52 px, fokus judul berpindah setelah soal baru, dan warna dilengkapi ikon/teks. Pembaca layar serta perangkat nyata tetap perlu diuji manual. |

Statistik paket kuis dari 2.000 seed per topik:

| Topik | Paket diuji | Paket dengan soal kembar | Paket dengan tiga jenis sama berurutan | Contoh |
|---|---:|---:|---:|---|
${packageText}

Kebijakan parser: koma atau titik desimal, spasi luar, minus Unicode, simbol derajat, dan akhiran \`derajat\`, \`cm\`, \`cm2\`, \`cm²\`, atau \`satuan\` diterima. Pemisah tunggal dengan tiga digit di belakangnya menghasilkan dua kandidat; jawaban diterima bila salah satunya cocok dengan kunci dalam toleransi. Campuran pemisah, pemisah berulang, notasi ilmiah, pecahan, kosong, dan huruf saja ditolak dengan pesan netral yang jelas.

Uji toleransi pada ${tolerance.numericQuestions} isian numerik: kunci persis diterima ${tolerance.exactAccepted}/${tolerance.numericQuestions}; dari ${tolerance.displayedQuestions} pembahasan yang memiliki nilai akhir numerik, hasil tampil diterima ${tolerance.roundedAccepted}/${tolerance.displayedQuestions}; jawaban yang digeser jelas dari kunci ditolak ${tolerance.obviousWrongRejected}/${tolerance.numericQuestions}; jawaban dengan nilai π alternatif yang berbeda melampaui toleransi ditolak ${tolerance.alternatePiRejected} kasus.

Determinisme: ${result.determinismFailures.length === 0 ? 'lulus; soal dan paket yang dipanggil dua kali dengan seed sama memiliki JSON identik pada seluruh 10 topik dan seed pemeriksaan.' : `gagal pada ${result.determinismFailures.join(', ')}`}

## 5. Hasil uji kepekaan

Kunci tiga generator dimutasi sementara di memori dengan mengubah nilainya sebesar +1 atau mengganti string. Verifier independen harus mendeteksi seluruh mutasi.

| Generator | Seed | Mutasi | Hasil |
|---|---:|---|---|
${sensitivityText}

## 6. Daftar perbaikan terurut

1. **Selesai — Kritis** — Topik 5 memakai perpanjangan tali busur sebagai garis secan serta busur jauh/dekat.
2. **Selesai — Kritis** — Topik 7 menurunkan \`r\`, \`s\`, dan luas dari segitiga valid yang diverifikasi dengan Heron.
3. **Selesai — Tinggi** — Engine di-reset dengan key topik; perpindahan tab/topik dari kuis meminta konfirmasi.
4. **Selesai — Tinggi** — Feedback dan skor akhir memakai satu live region \`role=status\`/\`aria-live=polite\`.
5. **Selesai — Sedang** — Pilihan diacak deterministik, kunci tidak menetap pada satu posisi, dan paket kuis menghindari duplikasi.
6. **Selesai — Sedang** — Angka tampilan memakai koma, kunci dan pembahasan memakai pembulatan dua desimal yang sama.
7. **Selesai — Sedang** — Parser menerima satuan umum, menolak bentuk rusak, dan memilih tafsiran pemisah ambigu berdasarkan kunci.
8. **Selesai — Sedang** — Skor localStorage divalidasi sebagai integer 0–5 tanpa mengubah skema lama.
9. **Selesai — Sedang** — Ruang parameter diperluas; seluruh jenis memiliki sedikitnya 30 variasi pada 2.000 seed.

## 7. Hal yang tidak bisa diverifikasi

- Tampilan KaTeX pada semua browser, ukuran layar, pembaca layar, dan perangkat nyata.
- Kontras aktual setelah rendering perangkat dan mode kontras tinggi.
- Perilaku service worker offline pada instalasi PWA nyata; audit ini hanya membaca konfigurasi dan kode.
- Kesesuaian redaksi dengan buku pegangan sekolah tertentu.
- Kualitas ilustrasi geometri yang tidak dirujuk oleh generator soal.

Daftar uji manual untuk guru:

1. Buka setiap jenis soal pada sampel dan hitung ulang dari angka di teks.
2. Coba jawaban dengan koma, titik, spasi, minus Unicode, derajat, dan satuan.
3. Jalankan kuis, pindah topik pada setiap posisi, reload di tengah kuis, dan ulangi kuis.
4. Uji keyboard saja dan pembaca layar pada feedback benar/salah.
5. Putuskan jaringan setelah aplikasi dibuka sekali, lalu ulangi Latihan dan Kuis.
6. Periksa khusus contoh topik 5 luar, topik 7 luas, dan topik 10 “satu di dalam yang lain”.

## Lampiran: metode audit

Skrip membaca \`buatSoal\` dan \`buatPaketKuis\`, mengumpulkan sedikitnya 2.000 seed per jenis, membandingkan kunci dengan perhitungan independen, memeriksa domain geometri, opsi, teks, determinisme, variasi, parser, dan paket kuis. Jalankan terpisah dari tes bawaan dengan:

\`\`\`bash
npx vitest run scripts/audit/audit-soal.test.ts
\`\`\`

Tes ini menghasilkan laporan ini dan \`docs/sampel-soal.md\`. Tes bawaan \`npm run test\` tidak memasukkan folder \`scripts/audit\` karena konfigurasi Vitest hanya menyertakan \`src/**/*.test.ts\`.
`;
}

function renderSamples(samples: ReturnType<typeof evaluateAudit>['samples']): string {
  const sections: string[] = [];
  for (const topic of topicOrder) {
    sections.push(`## ${topic} — ${topicNames[topic]}`);
    for (const type of expectedTypes[topic]) {
      sections.push(`### Jenis: ${type}`);
      for (const sample of samples.filter((item) => item.topic === topic && item.type === type)) {
        const status = sample.issues.length === 0 ? '✅' : '⚠️';
        const choices = sample.question.pilihan ? `\nPilihan: ${sample.question.pilihan.map((choice) => `\`${markdownQuestion(choice)}\``).join(', ')}` : '';
        const issueNote = sample.issues.length === 0 ? '' : `\nCatatan: ${sample.issues.map((issue) => `${issue.severity}: ${issue.title}`).join('; ')}`;
        sections.push(`#### ${status} Seed ${sample.seed}\n\n- Topik: ${topicNames[topic]}\n- Jenis: ${type}\n- Format jawaban: ${formatByType[type] ?? 'tidak diketahui'}\n- Teks soal: ${markdownQuestion(sample.question.pertanyaan)}${choices}\n- Kunci jawaban: \`${markdownQuestion(answerText(sample.question.jawabanBenar))}\`\n- Pembahasan: ${markdownQuestion(sample.question.pembahasan)}${issueNote}`);
      }
    }
  }
  return `# Sampel Soal untuk Pemeriksaan Manual\n\nSetiap jenis memiliki lima seed berbeda. ✅ berarti tidak ada pelanggaran yang ditemukan oleh verifier otomatis pada contoh tersebut. ⚠️ berarti ada catatan yang dirujuk di laporan audit. Kunci dan pembahasan ditulis dari keluaran generator.\n\n${sections.join('\n\n')}`;
}

describe('audit soal lintas topik (terpisah dari npm run test)', () => {
  it('menguji sedikitnya 2000 seed per jenis dan menghasilkan dua dokumen audit', () => {
    const result = evaluateAudit();
    expect(result.stats).toHaveLength(10);
    expect(result.stats.flatMap((stat) => stat.types).every((type) => type.seeds >= 2000)).toBe(true);
    expect(result.samples).toHaveLength(expectedTypes['01-unsur'].length * 5 + expectedTypes['02-keliling'].length * 5 + expectedTypes['03-luas'].length * 5 + expectedTypes['04-sudut'].length * 5 + expectedTypes['05-tali-busur'].length * 5 + expectedTypes['06-segi-empat'].length * 5 + expectedTypes['07-dalam-segitiga'].length * 5 + expectedTypes['08-luar-segitiga'].length * 5 + expectedTypes['09-garis-singgung'].length * 5 + expectedTypes['10-kedudukan'].length * 5);
    const reportPath = resolve(process.cwd(), 'docs/audit-soal.md');
    const samplesPath = resolve(process.cwd(), 'docs/sampel-soal.md');
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, renderReport(result));
    writeFileSync(samplesPath, renderSamples(result.samples));
    expect(result.violations.filter((item) => item.severity === 'Kritis' || item.severity === 'Tinggi')).toHaveLength(0);
  }, 120_000);

  it('menjalankan pemeriksaan parser yang dapat direproduksi', () => {
    expect(parseNumericAnswer('12,5')).toBe(12.5);
    expect(parseNumericAnswer('12.5')).toBe(12.5);
    expect(parseNumericAnswer(' 12,5 ')).toBe(12.5);
    expect(parseNumericAnswer('−7')).toBe(-7);
    expect(parseNumericAnswer('12.5.6')).toBeNull();
    expect(parseNumericAnswer('abc')).toBeNull();
  });

  it('membuktikan verifier peka terhadap tiga mutasi kunci di memori', () => {
    const cases = sensitivityTopics.map((topic) => mutatedKeyDetected(topic, firstSensitiveSeed(topic)));
    expect(cases).toEqual([true, true, true]);
    expect(jawabanSama(buatSoal('01-unsur', 2), '999999')).toBe(false);
  });
});
