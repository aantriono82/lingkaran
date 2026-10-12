import type { TopicId } from '../types';

export interface TopicFormulaSet {
  konsep: string[];
  eksplorasi: string[];
}

export const formulasByTopic: Record<TopicId, TopicFormulaSet> = {
  '01-unsur': {
    konsep: [
      String.raw`d = 2r`,
      String.raw`r = \frac{d}{2}`,
      String.raw`AB = 2\sqrt{r^2-a^2}`,
      String.raw`a = \sqrt{r^2-\left(\frac{AB}{2}\right)^2}`
    ],
    eksplorasi: [
      String.raw`d = 2r`,
      String.raw`r = \frac{d}{2}`,
      String.raw`AB \text{ menghubungkan dua titik pada lingkaran}`
    ]
  },
  '02-keliling': {
    konsep: [
      String.raw`\pi = \frac{K}{d}`,
      String.raw`K = \pi d = 2\pi r`,
      String.raw`\text{panjang busur} = \frac{\theta}{360^\circ} \times 2\pi r`,
      String.raw`a_{2n}=\frac{2a_n b_n}{a_n+b_n},\quad b_{2n}=\sqrt{a_{2n}b_n}`
    ],
    eksplorasi: [String.raw`K = 2\pi r = \pi d`, String.raw`a_{2n}=\frac{2a_n b_n}{a_n+b_n},\quad b_{2n}=\sqrt{a_{2n}b_n}`]
  },
  '03-luas': {
    konsep: [
      String.raw`L = \pi r^2`,
      String.raw`L_{\text{juring}} = \frac{\theta}{360^\circ} \times \pi r^2`,
      String.raw`L_{\text{tembereng}} = L_{\text{juring}} - L_{\Delta}`
    ],
    eksplorasi: [String.raw`L = \pi r^2`]
  },
  '04-sudut': {
    konsep: [
      String.raw`\angle AOB = 2 \times \angle ACB`,
      String.raw`\angle ACB = 90^\circ \text{ jika } AB \text{ diameter}`,
      String.raw`\angle ACB_1 = \angle ACB_2 \quad (\text{busur sama})`
    ],
    eksplorasi: [String.raw`\angle ACB = 90^\circ`, String.raw`\angle AOB = 2 \times \angle ACB`]
  },
  '05-tali-busur': {
    konsep: [
      String.raw`\angle_{\text{dalam}} = \frac{1}{2}(\widehat{AC} + \widehat{BD})`,
      String.raw`\angle_{\text{luar}} = \frac{1}{2}(\widehat{\text{besar}} - \widehat{\text{kecil}})`,
      String.raw`AP \times PB = CP \times PD`
    ],
    eksplorasi: [
      String.raw`\angle = \frac{1}{2}(\text{busur}_1 + \text{busur}_2)`,
      String.raw`\angle = \frac{1}{2}(\text{busur besar} - \text{busur kecil})`
    ]
  },
  '06-segi-empat': {
    konsep: [
      String.raw`\angle A + \angle C = 180^\circ`,
      String.raw`\angle B + \angle D = 180^\circ`,
      String.raw`\angle_{\text{luar}} = \angle_{\text{dalam berhadapan}}`,
      String.raw`p \times q = (a \times c) + (b \times d)`
    ],
    eksplorasi: []
  },
  '07-dalam-segitiga': {
    konsep: [
      String.raw`r = \frac{L}{s}`,
      String.raw`s = \frac{a+b+c}{2}`,
      String.raw`r_{\text{siku-siku}} = \frac{a+b-c}{2}`
    ],
    eksplorasi: [String.raw`r = \frac{L}{s}`]
  },
  '08-luar-segitiga': {
    konsep: [
      String.raw`R = \frac{abc}{4L}`,
      String.raw`R_{\text{siku-siku}} = \frac{1}{2}c`,
      String.raw`L = \frac{1}{2}\,\text{alas} \times \text{tinggi}`
    ],
    eksplorasi: [String.raw`R = \frac{abc}{4L}`]
  },
  '09-garis-singgung': {
    konsep: [
      String.raw`OT \perp PT\quad\Rightarrow\quad \angle OTP = 90^\circ`,
      String.raw`PT = \sqrt{OP^2-r^2}`,
      String.raw`l_{\text{luar}} = \sqrt{d^2-(R-r)^2}`,
      String.raw`l_{\text{dalam}} = \sqrt{d^2-(R+r)^2}`
    ],
    eksplorasi: [
      String.raw`OT \perp PT\quad\Rightarrow\quad \angle OTP = 90^\circ`,
      String.raw`PT = \sqrt{OP^2-r^2}`,
      String.raw`l_{\text{luar}} = \sqrt{d^2-(R-r)^2}\qquad l_{\text{dalam}} = \sqrt{d^2-(R+r)^2}`
    ]
  },
  '10-kedudukan': {
    konsep: [
      String.raw`d > R+r\;\Rightarrow\;\text{saling lepas}`,
      String.raw`R-r < d < R+r\;\Rightarrow\;\text{berpotongan di dua titik}`,
      String.raw`d=R+r\;\text{atau}\;d=R-r\;\Rightarrow\;\text{bersinggungan}`,
      String.raw`d<R-r\;\Rightarrow\;\text{satu di dalam yang lain}`
    ],
    eksplorasi: []
  }
};

export const allFormulas = Object.values(formulasByTopic).flatMap(({ konsep, eksplorasi }) => [...konsep, ...eksplorasi]);
