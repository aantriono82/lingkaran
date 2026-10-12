import type { ReactNode } from 'react';
import { MathText } from './MathText';

interface AnswerFeedbackProps {
  status?: 'benar' | 'salah';
  jawabanBenar?: string;
  pembahasan?: string;
  announcement?: string;
  children?: ReactNode;
}

export function AnswerFeedback({ status, jawabanBenar, pembahasan, announcement, children }: AnswerFeedbackProps) {
  const pesanEmpatik = status === 'benar'
    ? 'Tepat sekali! Pemahamanmu mantap.'
    : status === 'salah'
      ? 'Belum tepat, ayo periksa lagi langkahnya.'
      : '';

  const teksA11y = announcement ?? (status === 'benar'
    ? 'Jawaban benar.'
    : status === 'salah'
      ? `Belum tepat. Jawaban yang benar: ${jawabanBenar ?? ''}. ${pembahasan ? `Pembahasan: ${pembahasan}` : ''}`
      : '');

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={`answer-feedback-region ${status ? `feedback ${status}` : ''}`}>
      {status && (
        <div className="feedback-empathic-header">
          <div className="feedback-status-badge">
            <span aria-hidden="true" className="feedback-icon">{status === 'benar' ? '✓' : '!'}</span>
            <strong>{status === 'benar' ? 'Jawaban benar. Tepat sekali!' : pesanEmpatik}</strong>
          </div>
          {status === 'salah' && jawabanBenar && (
            <div className="feedback-key-row">
              <span className="key-label">Jawaban yang benar:</span>
              <strong className="key-value">{jawabanBenar}</strong>
            </div>
          )}
        </div>
      )}

      {pembahasan && (
        <div className="feedback-explanation-card">
          <span className="explanation-title">Pembahasan Langkah:</span>
          <div className="explanation-content">
            <MathText text={pembahasan} />
          </div>
        </div>
      )}

      {children && <div className="feedback-actions-row">{children}</div>}

      <span className="sr-only">{teksA11y}</span>
    </div>
  );
}
