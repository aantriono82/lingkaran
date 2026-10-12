import { describe, expect, it } from 'vitest';

import feedbackSource from './AnswerFeedback.tsx?raw';
import practiceSource from './PracticeEngine.tsx?raw';
import quizSource from './QuizEngine.tsx?raw';
import pageSource from '../pages/TopicPage.tsx?raw';
import layoutSource from './TopicLayout.tsx?raw';
import mathTextSource from './MathText.tsx?raw';

describe('regresi aksesibilitas alur jawaban', () => {
  it('menyediakan live region bersama untuk feedback dan hasil kuis', () => {
    expect(feedbackSource).toContain('role="status"');
    expect(feedbackSource).toContain('aria-live="polite"');
    expect(feedbackSource).toContain('Jawaban benar.');
    expect(feedbackSource).toContain('Belum tepat. Jawaban yang benar:');
    expect(practiceSource).toContain('<AnswerFeedback');
    expect(quizSource).toContain('<AnswerFeedback');
    expect(mathTextSource).toContain('katex.renderToString');
  });

  it('mereset engine dengan key topik dan meminta konfirmasi saat kuis ditinggalkan', () => {
    expect(pageSource).toContain('<PracticeEngine key={meta.id}');
    expect(pageSource).toContain('<QuizEngine key={meta.id}');
    expect(pageSource).toContain('Kuis sedang berjalan. Keluar akan menghapus kemajuan. Keluar?');
    expect(layoutSource).toContain('onNavigateAway');
  });
});
