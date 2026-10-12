import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalSudut(seed: number): Question {
  return buatSoalLegacy('04-sudut', seed);
}
