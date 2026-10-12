import type { Question } from '../../lib/quiz/types';
import { buatSoalLegacy } from '../../lib/quiz/generator';

export function buatSoalKeliling(seed: number, options?: { sertakanSoalAsalPi?: boolean }): Question {
  return buatSoalLegacy('02-keliling', seed, options?.sertakanSoalAsalPi ?? true);
}
