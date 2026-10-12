import type { TopicId } from '../types';
import type { TopicModule } from './types';
import { topicRegistry, cariTopik, indeksTopik, ambilTopikPerRumpun } from './metadata';

export { topicRegistry, cariTopik, indeksTopik, ambilTopikPerRumpun };

const ditemukan = import.meta.glob('./*/module.tsx', { eager: true, import: 'topicModule' }) as Record<string, TopicModule>;

export const topicModules: TopicModule[] = Object.values(ditemukan)
  .sort((a, b) => a.meta.nomor - b.meta.nomor)
  .map((modul) => ({ ...modul, rumpun: modul.meta.rumpun }));

export function cariModul(id: TopicId | string | undefined): TopicModule | undefined {
  return topicModules.find((modul) => modul.meta.id === id);
}

