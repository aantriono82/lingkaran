import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturLuas() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <g transform="translate(60, 60)">
        <circle cx="0" cy="0" r="42" fill={WARNA_TEMA.aksenMuda} stroke={WARNA_GEOMETRI.juring} strokeWidth="2" />
        <path d="M 0 0 L 42 0 A 42 42 0 0 0 29.7 -29.7 Z" fill={WARNA_TEMA.aksen} stroke={WARNA_GEOMETRI.juring} strokeWidth="1.5" />
        <path d="M 0 0 L 29.7 -29.7 A 42 42 0 0 0 0 -42 Z" fill={WARNA_TEMA.aksenMuda} stroke={WARNA_GEOMETRI.juring} strokeWidth="1.5" />
        <circle cx="0" cy="0" r="4" fill={WARNA_GEOMETRI.juring} />
      </g>
      <path d="M 115 60 L 132 60 M 128 55 L 133 60 L 128 65" stroke={WARNA_TEMA.teksLembut} strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(145, 42)">
        <path d="M 0 35 L 70 35 L 70 0 L 0 0 Z" fill={WARNA_TEMA.aksenMuda} stroke={WARNA_GEOMETRI.juring} strokeWidth="1.5" strokeDasharray="2 2" />
        <path d="M 0 35 L 8 0 L 18 35 L 28 0 L 38 35 L 48 0 L 58 35 L 68 0" fill="none" stroke={WARNA_GEOMETRI.juring} strokeWidth="2" />
        <text x="35" y="48" fontSize="9.5" fontWeight="700" fill={WARNA_GEOMETRI.juring} textAnchor="middle">panjang = π·r</text>
      </g>
    </svg>
  );
}
