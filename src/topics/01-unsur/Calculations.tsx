import { Formula } from '../../components';

function DiagramTaliBusurApotema() {
  return (
    <svg className="chord-apotema-diagram" viewBox="0 0 360 180" role="img" aria-label="Segitiga siku-siku untuk menghitung tali busur dan apotema">
      <circle cx="180" cy="90" r="65" fill="var(--warna-permukaan-redup)" stroke="var(--warna-utama)" strokeWidth="3" />
      <line x1="126" y1="54" x2="126" y2="126" stroke="var(--warna-tali-busur)" strokeWidth="5" strokeLinecap="round" />
      <line x1="180" y1="90" x2="126" y2="90" stroke="var(--warna-apotema)" strokeWidth="4" strokeDasharray="7 5" />
      <line x1="180" y1="90" x2="126" y2="54" stroke="var(--warna-radius)" strokeWidth="4" />
      <path d="M 126 90 L 135 90 L 135 81" fill="none" stroke="var(--warna-apotema)" strokeWidth="2.5" />
      <circle cx="180" cy="90" r="5" fill="var(--warna-pusat)" />
      <circle cx="126" cy="54" r="5" fill="var(--warna-tali-busur)" />
      <circle cx="126" cy="126" r="5" fill="var(--warna-tali-busur)" />
      <text x="188" y="86" className="concept-diagram-label">O</text>
      <text x="113" y="49" className="concept-diagram-label">A</text>
      <text x="113" y="143" className="concept-diagram-label">B</text>
      <text x="130" y="86" className="concept-diagram-label">M</text>
      <text x="151" y="75" className="concept-diagram-label">r</text>
      <text x="151" y="105" className="concept-diagram-label">a</text>
      <text x="106" y="95" className="concept-diagram-label">AB</text>
    </svg>
  );
}

export function PerhitunganUnsur() {
  return (
    <section className="concept-calculation-section" aria-labelledby="judul-perhitungan-unsur">
      <div>
        <span className="eyebrow">Langkah perhitungan</span>
        <h2 id="judul-perhitungan-unsur">Mencari panjang tali busur dan apotema</h2>
        <p className="calculation-intro-text">Tarik apotema OM dari pusat ke tali busur AB. Karena OM tegak lurus AB, segitiga OMA siku-siku dan AM = MB = setengah tali busur.</p>
      </div>
      <div className="calculation-intro">
        <DiagramTaliBusurApotema />
        <div className="calculation-key-formulas">
          <p><strong>Rumus yang dipakai</strong></p>
          <Formula rumus={String.raw`AB = 2\sqrt{r^2-a^2}`} label="Rumus panjang tali busur" />
          <Formula rumus={String.raw`a = \sqrt{r^2-\left(\frac{AB}{2}\right)^2}`} label="Rumus apotema" />
        </div>
      </div>
      <div className="calculation-grid">
        <article className="calculation-card chord-calculation">
          <h3><span className="calculation-index">1</span> Jika yang dicari panjang tali busur</h3>
          <p><strong>Contoh:</strong> jari-jari <em>r</em> = 10 cm dan apotema <em>a</em> = 6 cm.</p>
          <ol className="calculation-steps">
            <li><span>Hitung setengah tali busur, AM.</span><Formula rumus={String.raw`AM = \sqrt{10^2-6^2}=\sqrt{64}=8\ \text{cm}`} /></li>
            <li><span>Kalikan dua untuk mendapatkan AB.</span><Formula rumus={String.raw`AB = 2\times AM = 2\times 8 = \boxed{16\ \text{cm}}`} /></li>
          </ol>
        </article>
        <article className="calculation-card apotema-calculation">
          <h3><span className="calculation-index">2</span> Jika yang dicari apotema</h3>
          <p><strong>Contoh:</strong> jari-jari <em>r</em> = 10 cm dan panjang tali busur AB = 16 cm.</p>
          <ol className="calculation-steps">
            <li><span>Cari setengah tali busur, AM.</span><Formula rumus={String.raw`AM = \frac{AB}{2}=\frac{16}{2}=8\ \text{cm}`} /></li>
            <li><span>Gunakan segitiga siku-siku OMA.</span><Formula rumus={String.raw`a = \sqrt{10^2-8^2}=\sqrt{36}=\boxed{6\ \text{cm}}`} /></li>
          </ol>
        </article>
      </div>
    </section>
  );
}
