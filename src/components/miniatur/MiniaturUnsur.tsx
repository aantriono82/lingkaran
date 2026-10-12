import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturUnsur() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <circle cx="120" cy="60" r="44" fill={WARNA_TEMA.utamaMuda} stroke={WARNA_TEMA.utama} strokeWidth="2.5" />
      <line x1="120" y1="60" x2="164" y2="60" stroke={WARNA_GEOMETRI.radius} strokeWidth="3.5" strokeLinecap="round" />
      <text x="142" y="53" fill={WARNA_GEOMETRI.radius} fontSize="12" fontWeight="800">r</text>
      <circle cx="120" cy="60" r="5" fill={WARNA_TEMA.utama} />
      <text x="112" y="56" fill={WARNA_TEMA.utama} fontSize="11" fontWeight="800">O</text>
      <line x1="88" y1="91" x2="152" y2="91" stroke={WARNA_GEOMETRI.taliBusur} strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
      <circle cx="88" cy="91" r="4.5" fill={WARNA_GEOMETRI.taliBusur} />
      <circle cx="152" cy="91" r="4.5" fill={WARNA_GEOMETRI.taliBusur} />
      <text x="120" y="104" textAnchor="middle" fill={WARNA_GEOMETRI.taliBusur} fontSize="10" fontWeight="800">tali busur</text>
      <path d="M 152 91 A 44 44 0 0 1 88 91" fill="none" stroke={WARNA_GEOMETRI.busur} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
