import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturSudut() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <circle cx="120" cy="62" r="46" fill={WARNA_TEMA.utamaMuda} stroke={WARNA_GEOMETRI.busur} strokeWidth="2" />
      <circle cx="120" cy="62" r="4.5" fill={WARNA_TEMA.utama} />
      <circle cx="82" cy="88" r="4.5" fill={WARNA_GEOMETRI.radius} />
      <circle cx="158" cy="88" r="4.5" fill={WARNA_GEOMETRI.radius} />
      <circle cx="110" cy="17" r="4.5" fill={WARNA_GEOMETRI.tembereng} />
      <line x1="120" y1="62" x2="82" y2="88" stroke={WARNA_GEOMETRI.radius} strokeWidth="2.5" />
      <line x1="120" y1="62" x2="158" y2="88" stroke={WARNA_GEOMETRI.radius} strokeWidth="2.5" />
      <line x1="110" y1="17" x2="82" y2="88" stroke={WARNA_GEOMETRI.tembereng} strokeWidth="2" />
      <line x1="110" y1="17" x2="158" y2="88" stroke={WARNA_GEOMETRI.tembereng} strokeWidth="2" />
      <text x="120" y="52" fill={WARNA_TEMA.utama} fontSize="11" fontWeight="900" textAnchor="middle">2α</text>
      <text x="110" y="36" fill={WARNA_GEOMETRI.tembereng} fontSize="11" fontWeight="900" textAnchor="middle">α</text>
    </svg>
  );
}
