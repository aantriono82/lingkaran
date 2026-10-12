import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturGarisSinggung() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <circle cx="90" cy="60" r="38" fill={WARNA_TEMA.aksenMuda} stroke={WARNA_GEOMETRI.singgung} strokeWidth="2" />
      <circle cx="90" cy="60" r="4" fill={WARNA_TEMA.utama} />
      <circle cx="185" cy="60" r="5" fill={WARNA_GEOMETRI.diameter} />
      <text x="195" y="64" fontSize="11" fontWeight="900" fill={WARNA_GEOMETRI.diameter}>P</text>
      <line x1="185" y1="60" x2="108" y2="26" stroke={WARNA_GEOMETRI.singgung} strokeWidth="2.5" />
      <line x1="185" y1="60" x2="108" y2="94" stroke={WARNA_GEOMETRI.singgung} strokeWidth="2.5" />
      <circle cx="108" cy="26" r="4" fill={WARNA_GEOMETRI.radius} />
      <circle cx="108" cy="94" r="4" fill={WARNA_GEOMETRI.radius} />
      <line x1="90" y1="60" x2="108" y2="26" stroke={WARNA_GEOMETRI.radius} strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}
