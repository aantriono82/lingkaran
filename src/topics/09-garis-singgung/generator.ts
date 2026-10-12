import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalGarisSinggung(seed: number): Question {
  return buatSoalLegacy('09-garis-singgung', seed);
}
