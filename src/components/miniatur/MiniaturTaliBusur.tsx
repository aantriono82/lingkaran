import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturTaliBusur() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <circle cx="120" cy="60" r="44" fill={WARNA_TEMA.suksesMuda} stroke={WARNA_GEOMETRI.taliBusur} strokeWidth="2" />
      <line x1="85" y1="35" x2="155" y2="85" stroke={WARNA_GEOMETRI.taliBusur} strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
      <line x1="85" y1="85" x2="155" y2="35" stroke={WARNA_GEOMETRI.taliBusur} strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
      <circle cx="120" cy="60" r="4.5" fill={WARNA_GEOMETRI.potong} />
      <text x="120" y="52" fontSize="10" fontWeight="800" fill={WARNA_GEOMETRI.potong} textAnchor="middle">P</text>
    </svg>
  );
}
