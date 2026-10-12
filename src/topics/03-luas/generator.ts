import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalLuas(seed: number): Question {
  return buatSoalLegacy('03-luas', seed);
}
