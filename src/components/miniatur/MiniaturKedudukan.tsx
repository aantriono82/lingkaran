import { WARNA_GEOMETRI, WARNA_TEMA } from '../../lib/tokens';

export function MiniaturKedudukan() {
  return (
    <svg className="card-svg-preview" viewBox="0 0 240 120" aria-hidden="true">
      <circle cx="85" cy="60" r="40" fill={WARNA_TEMA.aksenMuda} stroke={WARNA_GEOMETRI.kedudukanA} strokeWidth="2.5" />
      <circle cx="85" cy="60" r="4" fill={WARNA_GEOMETRI.kedudukanA} />
      <circle cx="155" cy="60" r="30" fill={WARNA_TEMA.utamaMuda} stroke={WARNA_GEOMETRI.kedudukanB} strokeWidth="2.5" />
      <circle cx="155" cy="60" r="4" fill={WARNA_GEOMETRI.kedudukanB} />
      <line x1="85" y1="60" x2="155" y2="60" stroke={WARNA_TEMA.teksLembut} strokeWidth="2" strokeDasharray="4 3" />
      <text x="120" y="52" fontSize="10.5" fontWeight="900" fill={WARNA_TEMA.teksLembut} textAnchor="middle">jarak d</text>
    </svg>
  );
}
