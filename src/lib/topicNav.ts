import type { TopicId, TopicMeta } from '../types';
import { DAFTAR_RUMPUN } from '../types';
import { topicRegistry } from '../topics/metadata';

export interface InfoNavigasiTopik {
  sebelumnya: {
    ada: boolean;
    topik?: TopicMeta;
    label: string;
  };
  berikutnya: {
    ada: boolean;
    topik?: TopicMeta;
    label: string;
  };
}

export function formatEyebrowTopik(meta: TopicMeta, totalTopik: number = topicRegistry.length): string {
  const rumpun = DAFTAR_RUMPUN.find((r) => r.id === meta.rumpun);
  const romawi = rumpun ? rumpun.nomorRomawi : '';
  const nomorPadded = String(meta.nomor).padStart(2, '0');
  if (romawi) {
    return `Rumpun ${romawi} · Topik ${nomorPadded} dari ${totalTopik}`;
  }
  return `Topik ${nomorPadded} dari ${totalTopik}`;
}

export function tentukanNavigasiTopik(currentId: TopicId): InfoNavigasiTopik {
  const indeks = topicRegistry.findIndex((t) => t.id === currentId);
  if (indeks === -1) {
    return {
      sebelumnya: { ada: false, label: '← Topik sebelumnya' },
      berikutnya: { ada: false, label: 'Topik berikutnya →' }
    };
  }

  const prev = indeks > 0 ? topicRegistry[indeks - 1] : undefined;
  const next = indeks < topicRegistry.length - 1 ? topicRegistry[indeks + 1] : undefined;

  return {
    sebelumnya: {
      ada: Boolean(prev && prev.tersedia),
      topik: prev,
      label: prev ? `← Topik ${String(prev.nomor).padStart(2, '0')}` : '← Topik sebelumnya'
    },
    berikutnya: {
      ada: Boolean(next && next.tersedia),
      topik: next,
      label: next ? `Topik ${String(next.nomor).padStart(2, '0')} →` : 'Topik berikutnya →'
    }
  };
}
