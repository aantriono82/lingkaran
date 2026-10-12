import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalLingkaranLuar(seed: number): Question {
  return buatSoalLegacy('08-luar-segitiga', seed);
}
