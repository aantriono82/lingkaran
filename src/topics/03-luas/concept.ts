import { formulasByTopic } from '../../lib/formulas';

export const poinKonsep = [
  'Luas lingkaran (L) adalah ukuran seluruh daerah yang dilingkupi oleh keliling lingkaran: L = π r².',
  'Pendekatan persegi panjang: Menyusun juring-juring bergantian menghasilkan bangun mirip persegi panjang dengan alas πr dan tinggi r, sehingga L = πr × r = πr².',
  'Luas juring adalah bagian dari luas lingkaran sesuai perbandingan sudut pusatnya: L_juring = (θ/360°) × π r².',
  'Luas tembereng adalah luas daerah antara tali busur dan busurnya: L_tembereng = L_juring − L_segitiga.'
];

export const rumusKonsep = formulasByTopic['03-luas'].konsep;
