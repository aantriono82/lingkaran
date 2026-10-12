import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturLuarSegitiga() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <circle cx="120" cy="60" r="48" fill={WARNA_TEMA.utamaMuda} stroke={WARNA_GEOMETRI.lingkaranLuar} strokeWidth="2" />
      <polygon points="80,85 160,85 120,15" fill={WARNA_TEMA.permukaan} stroke={WARNA_GEOMETRI.lingkaranLuar} strokeWidth="2.5" />
      <circle cx="120" cy="60" r="4" fill={WARNA_GEOMETRI.lingkaranLuar} />
      <text x="120" y="53" fontSize="10" fontWeight="800" fill={WARNA_GEOMETRI.lingkaranLuar} textAnchor="middle">O</text>
    </svg>
  );
}
