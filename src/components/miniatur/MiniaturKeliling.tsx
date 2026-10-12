import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturKeliling() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <line x1="30" y1="95" x2="210" y2="95" stroke={WARNA_TEMA.teksLembut} strokeWidth="2" />
      <line x1="50" y1="95" x2="50" y2="102" stroke={WARNA_TEMA.teksLembut} strokeWidth="1.5" />
      <line x1="110" y1="95" x2="110" y2="102" stroke={WARNA_TEMA.teksLembut} strokeWidth="1.5" />
      <line x1="170" y1="95" x2="170" y2="102" stroke={WARNA_TEMA.teksLembut} strokeWidth="1.5" />
      <text x="50" y="112" fontSize="9" fill={WARNA_TEMA.teksLembut} textAnchor="middle">0</text>
      <text x="110" y="112" fontSize="9" fill={WARNA_TEMA.teksLembut} textAnchor="middle">π·d/2</text>
      <text x="170" y="112" fontSize="9" fill={WARNA_TEMA.teksLembut} textAnchor="middle">K = π·d</text>
      <path d="M 50 95 L 170 95" stroke={WARNA_GEOMETRI.taliBusur} strokeWidth="4" strokeLinecap="round" />
      <circle cx="85" cy="55" r="40" fill={WARNA_TEMA.permukaanRedup} stroke={WARNA_GEOMETRI.diameter} strokeWidth="2.5" />
      <circle cx="85" cy="55" r="4" fill={WARNA_TEMA.utama} />
      <line x1="45" y1="55" x2="125" y2="55" stroke={WARNA_GEOMETRI.diameter} strokeWidth="2.5" strokeDasharray="4 3" />
      <text x="85" y="45" fill={WARNA_GEOMETRI.diameter} fontSize="11" fontWeight="800" textAnchor="middle">d = 2r</text>
    </svg>
  );
}
