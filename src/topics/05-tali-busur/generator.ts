import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalTaliBusur(seed: number): Question {
  return buatSoalLegacy('05-tali-busur', seed);
}
