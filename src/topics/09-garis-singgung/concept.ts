import { formulasByTopic } from '../../lib/formulas';

export const poinKonsep = [
  'Sifat Dasar Garis Singgung: Garis singgung memotong lingkaran tepat di satu titik. Jari-jari yang ditarik ke titik singgung selalu tegak lurus terhadap garis singgung (OT ⊥ PT, ∠OTP = 90°).',
  'Dua Garis Singgung dari Titik Luar: Dari sebuah titik P di luar lingkaran dapat ditarik dua garis singgung yang sama panjang. Panjangnya dihitung dengan teorema Pythagoras: PT = √(OP² − r²).',
  'Garis Singgung Persekutuan Luar (GSPL): Menyinggung dua lingkaran pada sisi yang sama. Panjang ruas garis singgung luar dihitung dengan: l_luar = √(d² − (R − r)²), dengan d adalah jarak antarpusat.',
  'Garis Singgung Persekutuan Dalam (GSPD): Menyinggung dua lingkaran secara menyilang/menyeberang di antara kedua lingkaran. Panjangnya dihitung dengan: l_dalam = √(d² − (R + r)²).'
];

export const rumusKonsep = formulasByTopic['09-garis-singgung'].konsep;
