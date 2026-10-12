import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PiText } from './Pi';
import { AnswerFeedback } from './AnswerFeedback';
import type { TopicId } from '../types';
import { buatPaketKuis, jawabanSama, pesanKesalahanNumerik } from '../lib/quiz/generator';
import { ambilSkorTerbaik, simpanSkorTerbaik } from '../lib/storage';
import { bacaSesiKuis, hapusSesiKuis, simpanSesiKuis, VERSI_SESI_KUIS } from '../lib/quiz/session';
import { formatProgresKuis, pesanHasilKuis, tentukanAksiHasilKuis } from '../lib/quiz/result';

interface QuizEngineProps {
  topikId: TopicId;
  onRunningChange?: (berjalan: boolean) => void;
  onKembaliKeEksplorasi?: () => void;
}

function KonfetiBintang() {
  return (
    <div className="svg-confetti-container" aria-hidden="true">
      <svg className="svg-confetti" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
        <g className="confetti-star star-1"><polygon points="40,25 43,33 52,33 45,38 48,46 40,41 32,46 35,38 28,33 37,33" fill="var(--warna-peringatan)" /></g>
        <g className="confetti-star star-2"><circle cx="100" cy="50" r="5" fill="var(--warna-sukses)" /></g>
        <g className="confetti-star star-3"><polygon points="170,20 173,28 182,28 175,33 178,41 170,36 162,41 165,33 158,28 167,28" fill="var(--warna-aksen)" /></g>
        <g className="confetti-star star-4"><circle cx="230" cy="45" r="6" fill="var(--warna-radius)" /></g>
        <g className="confetti-star star-5"><polygon points="300,25 303,33 312,33 305,38 308,46 300,41 292,46 295,38 288,33 297,33" fill="var(--warna-sukses)" /></g>
        <g className="confetti-star star-6"><circle cx="70" cy="75" r="4.5" fill="var(--warna-busur)" /></g>
        <g className="confetti-star star-7"><polygon points="140,70 143,77 151,77 145,82 147,90 140,85 133,90 135,82 129,77 137,77" fill="var(--warna-peringatan)" /></g>
        <g className="confetti-star star-8"><circle cx="270" cy="80" r="5" fill="var(--warna-aksen)" /></g>
        <g className="confetti-star star-9"><polygon points="340,65 343,73 352,73 345,78 348,86 340,81 332,86 335,78 328,73 337,73" fill="var(--warna-tali-busur)" /></g>
      </svg>
    </div>
  );
}

export function QuizEngine({ topikId, onRunningChange, onKembaliKeEksplorasi }: QuizEngineProps) {
  const [sesiAwal] = useState(() => bacaSesiKuis(topikId));
  const [sesiTertunda, setSesiTertunda] = useState(sesiAwal);
  const [dimulai, setDimulai] = useState(() => sesiAwal === null);
  const [seed, setSeed] = useState(() => sesiAwal?.seed ?? Date.now());
  const soal = useMemo(() => buatPaketKuis(topikId, seed), [topikId, seed]);
  const [indeks, setIndeks] = useState(() => sesiAwal?.indeks ?? 0);
  const [jawaban, setJawaban] = useState(() => sesiAwal?.jawaban ?? '');
  const [skor, setSkor] = useState(() => sesiAwal?.skor ?? 0);
  const [selesai, setSelesai] = useState(false);
  const [sudahDijawab, setSudahDijawab] = useState(() => sesiAwal?.sudahDijawab ?? false);
  const judulRef = useRef<HTMLHeadingElement>(null);
  const fokusSoalBaru = useRef(false);
  const soalAktif = soal[indeks];
  const skorTerbaik = ambilSkorTerbaik(topikId);
  const skorTerbaikTampilan = Math.max(skorTerbaik ?? 0, skor);
  const benar = sudahDijawab && jawabanSama(soalAktif, jawaban);
  const pesanInput = sudahDijawab && !benar && typeof soalAktif.jawabanBenar === 'number' ? pesanKesalahanNumerik(jawaban) : null;
  const kunciTampilan = typeof soalAktif.jawabanBenar === 'number' ? String(soalAktif.jawabanBenar).replace('.', ',') : String(soalAktif.jawabanBenar);

  useEffect(() => {
    onRunningChange?.(dimulai && !selesai);
    window.dispatchEvent(new CustomEvent('quiz-activity', { detail: { aktif: dimulai && !selesai } }));
  }, [dimulai, selesai, onRunningChange]);

  useEffect(() => {
    if (!dimulai || selesai) return;
    simpanSesiKuis({
      versi: VERSI_SESI_KUIS,
      topikId,
      seed,
      indeks,
      jawaban,
      skor,
      sudahDijawab
    });
  }, [dimulai, selesai, topikId, seed, indeks, jawaban, skor, sudahDijawab]);

  useEffect(() => {
    if (fokusSoalBaru.current) {
      fokusSoalBaru.current = false;
      judulRef.current?.focus();
    }
  }, [indeks, seed]);

  function pilihJawaban(nilai: string): void {
    if (!sudahDijawab) setJawaban(nilai);
  }

  function lanjut(): void {
    if (sudahDijawab) return;
    const skorBaru = skor + (jawabanSama(soalAktif, jawaban) ? 1 : 0);
    setSkor(skorBaru);
    setSudahDijawab(true);
    if (indeks === soal.length - 1) {
      setSelesai(true);
      hapusSesiKuis();
      simpanSkorTerbaik(topikId, skorBaru);
    }
  }

  function keSoalBerikutnya(): void {
    if (indeks >= soal.length - 1) return;
    fokusSoalBaru.current = true;
    setIndeks(indeks + 1);
    setJawaban('');
    setSudahDijawab(false);
  }

  function ulangi(): void {
    hapusSesiKuis();
    fokusSoalBaru.current = true;
    setDimulai(true);
    setSesiTertunda(null);
    setSeed((nilai) => nilai + 1);
    setIndeks(0);
    setJawaban('');
    setSkor(0);
    setSelesai(false);
    setSudahDijawab(false);
  }

  function lanjutkanSesi(): void {
    setDimulai(true);
    setSesiTertunda(null);
  }

  function mulaiBaru(): void {
    hapusSesiKuis();
    setSesiTertunda(null);
    setDimulai(true);
    setSeed(Date.now());
    setIndeks(0);
    setJawaban('');
    setSkor(0);
    setSelesai(false);
    setSudahDijawab(false);
  }

  if (!dimulai && sesiTertunda) {
    return (
      <section className="learning-card quiz-resume-card" aria-labelledby="judul-resume-kuis">
        <div className="resume-badge">
          <span className="eyebrow">Kuis Tersimpan</span>
        </div>
        <h2 id="judul-resume-kuis" className="resume-title">Lanjutkan kuis sebelumnya?</h2>
        <p className="resume-desc">
          Kemajuan kamu pada <strong>Soal {sesiTertunda.indeks + 1} dari {soal.length}</strong> tersimpan rapi dan dapat dilanjutkan sekarang.
        </p>
        <div className="resume-actions-group">
          <button type="button" className="button primary btn-pill" onClick={lanjutkanSesi}>
            Lanjutkan kuis
          </button>
          <button type="button" className="button secondary btn-pill" onClick={mulaiBaru}>
            Mulai dari awal
          </button>
        </div>
      </section>
    );
  }

  if (selesai) {
    const persentase = skor * 20;
    const infoHasil = pesanHasilKuis(skor, soal.length);
    const aksiHasil = tentukanAksiHasilKuis(topikId);
    const radiusCincin = 48;
    const kelilingCincin = 2 * Math.PI * radiusCincin;
    const dashOffset = kelilingCincin * (1 - skor / soal.length);

    return (
      <section className="learning-card quiz-result-card" aria-labelledby="judul-hasil-kuis">
        {infoHasil.sempurna && <KonfetiBintang />}

        <div className="result-header">
          <span className="eyebrow result-eyebrow">Hasil Kuis Selesai</span>
          <h2 id="judul-hasil-kuis" className="result-title">{infoHasil.judul}</h2>
        </div>

        {/* Skor Lingkaran dengan Cincin Progres SVG */}
        <div className="result-score-ring-wrap" aria-label={`Skor kamu ${skor} dari ${soal.length} (${persentase}%)`}>
          <svg className="score-ring-svg" viewBox="0 0 120 120" width="120" height="120">
            <circle
              className="score-ring-bg"
              cx="60"
              cy="60"
              r={radiusCincin}
              fill="none"
              stroke="var(--warna-garis)"
              strokeWidth="9"
            />
            <circle
              className="score-ring-progress"
              cx="60"
              cy="60"
              r={radiusCincin}
              fill="none"
              stroke={infoHasil.sempurna ? 'var(--warna-peringatan)' : infoHasil.lulus ? 'var(--warna-sukses)' : 'var(--warna-aksen)'}
              strokeWidth="9"
              strokeDasharray={kelilingCincin}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="score-ring-text">
            <strong className="ring-number">{skor}/{soal.length}</strong>
            <span className="ring-percent">{persentase}%</span>
          </div>
        </div>

        <p className="result-motivational-msg">{infoHasil.pesan}</p>

        {skorTerbaikTampilan > 0 && (
          <div className="result-best-badge">
            <span aria-hidden="true">★</span>
            <span>Skor terbaik tersimpan di perangkat ini: <strong>{skorTerbaikTampilan} / {soal.length}</strong></span>
          </div>
        )}

        <AnswerFeedback announcement={`Kuis selesai. Skor kamu ${skor} dari ${soal.length}. ${infoHasil.pesan}`} />

        {/* Tombol aksi navigasi hasil kuis */}
        <div className="result-actions-nav">
          <Link to={aksiHasil.targetTautan} className="button primary btn-action-next">
            <span>{aksiHasil.labelPrimer}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <button type="button" className="button secondary btn-action-repeat" onClick={ulangi}>
            <span aria-hidden="true">↺</span> Ulangi kuis
          </button>
          {onKembaliKeEksplorasi && (
            <button type="button" className="button outline btn-action-explore" onClick={onKembaliKeEksplorasi}>
              Kembali ke Eksplorasi
            </button>
          )}
        </div>
      </section>
    );
  }

  const progres = formatProgresKuis(indeks, soal.length);

  return (
    <section className="learning-card engine-card quiz-engine-card" aria-labelledby="judul-soal-kuis">
      {/* Bilah Progres Kuis */}
      <div className="quiz-progress-bar-wrap">
        <div className="progress-labels-row">
          <span className="progress-step-text">{progres.label}</span>
          <span className="progress-pct-text">{progres.persentase}%</span>
        </div>
        <div
          className="quiz-progress-track"
          role="progressbar"
          aria-valuenow={indeks + 1}
          aria-valuemin={1}
          aria-valuemax={soal.length}
          aria-label={progres.label}
        >
          <div className="quiz-progress-fill" style={{ width: `${progres.persentase}%` }} />
        </div>
      </div>

      <h3 id="judul-soal-kuis" ref={judulRef} tabIndex={-1} className="question-text">
        <PiText text={soalAktif.pertanyaan} />
      </h3>

      {soalAktif.jenis === 'pilihan' && soalAktif.pilihan ? (
        <div className="answer-options-grid" role="group" aria-label="Pilihan jawaban">
          {soalAktif.pilihan.map((pilihan, pIndeks) => {
            const isSelected = jawaban === pilihan;
            let statusClass = '';
            if (sudahDijawab) {
              if (jawabanSama(soalAktif, pilihan)) {
                statusClass = 'option-correct';
              } else if (isSelected && !benar) {
                statusClass = 'option-incorrect';
              }
            }

            return (
              <button
                key={pilihan}
                type="button"
                className={`answer-option-btn ${isSelected ? 'selected' : ''} ${statusClass}`}
                onClick={() => pilihJawaban(pilihan)}
                disabled={sudahDijawab}
                aria-pressed={isSelected}
              >
                <span className="option-letter-badge" aria-hidden="true">
                  {String.fromCharCode(65 + pIndeks)}
                </span>
                <span className="option-text-wrap">
                  <PiText text={pilihan} />
                </span>
                {sudahDijawab && (
                  <span className="option-status-icon" aria-hidden="true">
                    {jawabanSama(soalAktif, pilihan) ? '✓' : isSelected && !benar ? '✗' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <label className="answer-input-deck">
          <span className="input-label-text">Tuliskan Angka Jawabanmu:</span>
          <input
            className="input-number-field"
            aria-label="Jawabanmu"
            inputMode="decimal"
            value={jawaban}
            disabled={sudahDijawab}
            onChange={(event) => setJawaban(event.target.value)}
            placeholder="Ketik angka desimal..."
          />
        </label>
      )}

      {!sudahDijawab ? (
        <button
          type="button"
          className="button primary full-width btn-submit-answer"
          onClick={lanjut}
          disabled={!jawaban.trim()}
        >
          Kunci Jawaban
        </button>
      ) : (
        <AnswerFeedback
          status={benar ? 'benar' : 'salah'}
          jawabanBenar={kunciTampilan}
          pembahasan={pesanInput ?? soalAktif.pembahasan}
        >
          <button type="button" className="button secondary btn-next-question" onClick={keSoalBerikutnya}>
            {indeks < soal.length - 1 ? 'Lanjut ke Soal Berikutnya →' : 'Lihat Hasil Kuis →'}
          </button>
        </AnswerFeedback>
      )}
    </section>
  );
}
