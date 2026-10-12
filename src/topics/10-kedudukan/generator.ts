import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalKedudukan(seed: number): Question {
  return buatSoalLegacy('10-kedudukan', seed);
}
