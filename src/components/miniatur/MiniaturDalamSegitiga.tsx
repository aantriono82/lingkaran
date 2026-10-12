import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturDalamSegitiga() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <polygon points="50,95 190,95 110,25" fill={WARNA_TEMA.suksesMuda} stroke={WARNA_GEOMETRI.lingkaranDalam} strokeWidth="2.5" />
      <circle cx="116.6" cy="71.7" r="23.3" fill={WARNA_TEMA.utamaMuda} stroke={WARNA_GEOMETRI.lingkaranDalam} strokeWidth="2.5" />
      <circle cx="116.6" cy="71.7" r="4" fill={WARNA_GEOMETRI.lingkaranDalam} />
      <text x="116.6" y="66" fontSize="10" fontWeight="900" fill={WARNA_GEOMETRI.lingkaranDalam} textAnchor="middle">I</text>
      <line x1="116.6" y1="71.7" x2="116.6" y2="95" stroke={WARNA_GEOMETRI.radius} strokeWidth="2" strokeDasharray="3 3" />
      <text x="122" y="86" fontSize="10" fontWeight="800" fill={WARNA_GEOMETRI.radius}>r</text>
    </svg>
  );
}
