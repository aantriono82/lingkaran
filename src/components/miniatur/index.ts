import type React from 'react';
import type { TopicId } from '../../types';
import { MiniaturUnsur } from './MiniaturUnsur';
import { MiniaturKeliling } from './MiniaturKeliling';
import { MiniaturLuas } from './MiniaturLuas';
import { MiniaturSudut } from './MiniaturSudut';
import { MiniaturTaliBusur } from './MiniaturTaliBusur';
import { MiniaturSegiEmpat } from './MiniaturSegiEmpat';
import { MiniaturDalamSegitiga } from './MiniaturDalamSegitiga';
import { MiniaturLuarSegitiga } from './MiniaturLuarSegitiga';
import { MiniaturGarisSinggung } from './MiniaturGarisSinggung';
import { MiniaturKedudukan } from './MiniaturKedudukan';

export {
  MiniaturUnsur,
  MiniaturKeliling,
  MiniaturLuas,
  MiniaturSudut,
  MiniaturTaliBusur,
  MiniaturSegiEmpat,
  MiniaturDalamSegitiga,
  MiniaturLuarSegitiga,
  MiniaturGarisSinggung,
  MiniaturKedudukan
};

export type MiniaturKomponen = () => React.JSX.Element;

export const petaMiniatur: Record<TopicId, MiniaturKomponen> = {
  '01-unsur': MiniaturUnsur,
  '02-keliling': MiniaturKeliling,
  '03-luas': MiniaturLuas,
  '04-sudut': MiniaturSudut,
  '05-tali-busur': MiniaturTaliBusur,
  '06-segi-empat': MiniaturSegiEmpat,
  '07-dalam-segitiga': MiniaturDalamSegitiga,
  '08-luar-segitiga': MiniaturLuarSegitiga,
  '09-garis-singgung': MiniaturGarisSinggung,
  '10-kedudukan': MiniaturKedudukan
};
