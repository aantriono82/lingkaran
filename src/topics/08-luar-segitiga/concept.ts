import { formulasByTopic } from '../../lib/formulas';

export const poinKonsep = [
  'Definisi Lingkaran Luar: Lingkaran yang melalui ketiga titik sudut sebuah segitiga (A, B, dan C).',
  'Titik Pusat Circumcenter (O): Pusat lingkaran luar merupakan titik temu ketiga garis sumbu ketiga sisi segitiga. Jarak dari titik O ke setiap titik sudut segitiga sama panjang, yaitu jari-jari R.',
  'Rumus Jari-Jari Umum (R = abc / 4L): Jari-jari lingkaran luar dihitung dari perkalian ketiga panjang sisi segitiga dibagi 4 kali luas segitiga.',
  'Letak Titik Pusat O: Pada segitiga lancip, O berada di dalam segitiga; pada segitiga siku-siku, O tepat di tengah sisi miring sehingga R = ½c; sedangkan pada segitiga tumpul, O berada di luar segitiga.'
];

export const rumusKonsep = formulasByTopic['08-luar-segitiga'].konsep;
