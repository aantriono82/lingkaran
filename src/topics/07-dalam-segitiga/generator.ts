import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalLingkaranDalam(seed: number): Question {
  return buatSoalLegacy('07-dalam-segitiga', seed);
}
