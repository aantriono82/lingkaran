import { useEffect, useRef, useState } from 'react';
import { PiText } from './Pi';
import { AnswerFeedback } from './AnswerFeedback';
import type { TopicId } from '../types';
import { buatSoal, jawabanSama, pesanKesalahanNumerik } from '../lib/quiz/generator';
import type { Question } from '../lib/quiz/types';

export function PracticeEngine({ topikId }: { topikId: TopicId }) {
  const [seed, setSeed] = useState(() => Date.now());
  const [soal, setSoal] = useState<Question>(() => buatSoal(topikId, seed));
  const [jawaban, setJawaban] = useState('');
  const [diperiksa, setDiperiksa] = useState(false);
  const judulRef = useRef<HTMLHeadingElement>(null);
  const fokusSoalBaru = useRef(false);
  const benar = diperiksa && jawabanSama(soal, jawaban);
  const pesanInput = diperiksa && !benar && typeof soal.jawabanBenar === 'number' ? pesanKesalahanNumerik(jawaban) : null;
  const kunciTampilan = typeof soal.jawabanBenar === 'number' ? String(soal.jawabanBenar).replace('.', ',') : String(soal.jawabanBenar);

  useEffect(() => {
    if (fokusSoalBaru.current) {
      fokusSoalBaru.current = false;
      judulRef.current?.focus();
    }
  }, [seed]);

  function soalBaru(): void {
    const seedBaru = seed + 1;
    fokusSoalBaru.current = true;
    setSeed(seedBaru);
    setSoal(buatSoal(topikId, seedBaru));
    setJawaban('');
    setDiperiksa(false);
  }

  return (
    <section className="learning-card engine-card practice-engine-card" aria-labelledby="judul-soal-latihan">
      <div className="engine-heading-unified">
        <div>
          <span className="eyebrow practice-eyebrow">Latihan Mandiri Tanpa Nilai</span>
          <h2 className="practice-title">Uji Pemahamanmu</h2>
        </div>
        <button type="button" className="button secondary btn-new-practice" onClick={soalBaru}>
          <span aria-hidden="true">↺</span> Soal baru
        </button>
      </div>

      <h3 id="judul-soal-latihan" ref={judulRef} tabIndex={-1} className="question-text">
        <PiText text={soal.pertanyaan} />
      </h3>

      {soal.jenis === 'pilihan' && soal.pilihan ? (
        <div className="answer-options-grid" role="group" aria-label="Pilihan jawaban">
          {soal.pilihan.map((pilihan, pIndeks) => {
            const isSelected = jawaban === pilihan;
            let statusClass = '';
            if (diperiksa) {
              if (jawabanSama(soal, pilihan)) {
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
                onClick={() => {
                  setJawaban(pilihan);
                  setDiperiksa(false);
                }}
                aria-pressed={isSelected}
              >
                <span className="option-letter-badge" aria-hidden="true">
                  {String.fromCharCode(65 + pIndeks)}
                </span>
                <span className="option-text-wrap">
                  <PiText text={pilihan} />
                </span>
                {diperiksa && (
                  <span className="option-status-icon" aria-hidden="true">
                    {jawabanSama(soal, pilihan) ? '✓' : isSelected && !benar ? '✗' : ''}
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
            onChange={(event) => {
              setJawaban(event.target.value);
              setDiperiksa(false);
            }}
            placeholder="Ketik angka desimal..."
          />
        </label>
      )}

      <button
        type="button"
        className="button primary full-width btn-submit-answer"
        onClick={() => setDiperiksa(true)}
        disabled={!jawaban.trim()}
      >
        Periksa Jawaban
      </button>

      <AnswerFeedback
        status={diperiksa ? (benar ? 'benar' : 'salah') : undefined}
        jawabanBenar={kunciTampilan}
        pembahasan={diperiksa ? (pesanInput ?? soal.pembahasan) : undefined}
      />
    </section>
  );
}
