import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturSegiEmpat() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <circle cx="120" cy="60" r="44" fill={WARNA_TEMA.peringatanMuda} stroke={WARNA_GEOMETRI.segiEmpatA} strokeWidth="2" />
      <polygon points="90,30 155,35 150,95 85,85" fill={WARNA_TEMA.aksenMuda} stroke={WARNA_GEOMETRI.segiEmpatA} strokeWidth="2.5" />
      <text x="90" y="44" fontSize="10" fontWeight="900" fill={WARNA_GEOMETRI.segiEmpatA}>∠A</text>
      <text x="135" y="88" fontSize="10" fontWeight="900" fill={WARNA_GEOMETRI.segiEmpatA}>∠C</text>
      <text x="120" y="114" fontSize="10" fontWeight="800" fill={WARNA_TEMA.utama} textAnchor="middle">∠A + ∠C = 180°</text>
    </svg>
  );
}
