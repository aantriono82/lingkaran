import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalSegiEmpat(seed: number): Question {
  return buatSoalLegacy('06-segi-empat', seed);
}
