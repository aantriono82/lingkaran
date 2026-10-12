import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useParams } from 'react-router-dom';
import type { TabId } from '../types';
import { PiText, PracticeEngine, QuizEngine, TopicLayout, Formula } from '../components';
import { cariModul, cariTopik, indeksTopik, topicRegistry } from '../topics/registry';
import { hapusSesiKuis } from '../lib/quiz/session';
import { simpanTopikTerakhir } from '../lib/storage';

export function TopicPage() {
  const { id } = useParams();
  const meta = cariTopik(id);
  const [tab, setTab] = useState<TabId>('eksplorasi');
  const [kuisBerjalan, setKuisBerjalan] = useState(false);

  useEffect(() => {
    if (meta?.id && meta.tersedia) {
      simpanTopikTerakhir(meta.id);
    }
  }, [meta?.id, meta?.tersedia]);

  useEffect(() => {
    setTab('eksplorasi');
  }, [id]);

  const modul = cariModul(meta?.id);

  if (!meta || !modul || !meta.tersedia) return <div className="page-shell missing-page"><h1>Topik belum tersedia</h1><p>Topik ini sedang disiapkan.</p><a className="button primary" href="#/">Kembali ke beranda</a></div>;
  const indeks = indeksTopik(meta.id);
  const sebelumnya = topicRegistry[indeks - 1];
  const berikutnya = topicRegistry[indeks + 1];
  const konsep = modul.concept;
  const Explore = modul.Explore;
  const ConceptExtra = modul.ConceptExtra;
  function konfirmasiKeluar(): boolean {
    if (!kuisBerjalan) return true;
    const bolehKeluar = window.confirm('Kuis sedang berjalan. Keluar akan menghapus kemajuan. Keluar?');
    if (bolehKeluar) {
      hapusSesiKuis();
      window.dispatchEvent(new CustomEvent('quiz-activity', { detail: { aktif: false } }));
    }
    return bolehKeluar;
  }

  function ubahTab(tabBerikutnya: TabId): void {
    if (tabBerikutnya !== 'kuis' && tab === 'kuis' && !konfirmasiKeluar()) return;
    if (tab === 'kuis' && tabBerikutnya !== 'kuis') {
      hapusSesiKuis();
      setKuisBerjalan(false);
      window.dispatchEvent(new CustomEvent('quiz-activity', { detail: { aktif: false } }));
    }
    setTab(tabBerikutnya);
  }

  function cegahKeluarKuis(event: MouseEvent<HTMLAnchorElement>): void {
    if (!konfirmasiKeluar()) event.preventDefault();
  }

  return (
    <TopicLayout meta={meta} tab={tab} onTabChange={ubahTab} sebelumnya={sebelumnya} berikutnya={berikutnya} onNavigateAway={cegahKeluarKuis}>
      {tab === 'eksplorasi' && (
        <div id="panel-eksplorasi" role="tabpanel" aria-labelledby="tab-eksplorasi">
          <Explore />
        </div>
      )}
      {tab === 'konsep' && (
        <section id="panel-konsep" role="tabpanel" aria-labelledby="tab-konsep" className="concept-layout">
          <article className="learning-card concept-card">
            <div className="concept-header">
              <span className="eyebrow">Ringkasan inti</span>
              <h2>Yang perlu kamu ingat</h2>
            </div>
            <ul className="concept-points-list">
              {konsep.poin.map((butir, idx) => (
                <li key={butir}>
                  <span className="concept-point-badge" aria-hidden="true">{idx + 1}</span>
                  <div className="concept-point-text"><PiText text={butir} /></div>
                </li>
              ))}
            </ul>
          </article>
          <aside className="learning-card formula-card">
            <div className="concept-header">
              <span className="eyebrow">Rumus kunci</span>
              <h2>Rumus penting</h2>
            </div>
            <div className="formula-deck-list">
              {konsep.rumus.map((item) => (
                <Formula key={item} rumus={item} />
              ))}
            </div>
          </aside>
          {ConceptExtra && (
            <div className="concept-extra-wrap">
              <ConceptExtra />
            </div>
          )}
        </section>
      )}
      {tab === 'latihan' && (
        <section id="panel-latihan" role="tabpanel" aria-labelledby="tab-latihan" className="single-engine">
          <PracticeEngine key={meta.id} topikId={meta.id} />
        </section>
      )}
      {tab === 'kuis' && (
        <section id="panel-kuis" role="tabpanel" aria-labelledby="tab-kuis" className="single-engine">
          <QuizEngine key={meta.id} topikId={meta.id} onRunningChange={setKuisBerjalan} onKembaliKeEksplorasi={() => ubahTab('eksplorasi')} />
        </section>
      )}
    </TopicLayout>
  );
}

