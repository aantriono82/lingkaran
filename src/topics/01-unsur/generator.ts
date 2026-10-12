import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalUnsur(seed: number): Question {
  return buatSoalLegacy('01-unsur', seed);
}
