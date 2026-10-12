import type { ComponentType } from 'react';
import type { Question } from '../lib/quiz/types';
import type { RumpunId, TopicMeta } from '../types';

export interface TopicConcept {
  poin: string[];
  rumus: string[];
}

export interface TopicModule {
  meta: TopicMeta;
  rumpun?: RumpunId;
  Explore: ComponentType;
  concept: TopicConcept;
  generator: (seed: number, options?: { sertakanSoalAsalPi?: boolean }) => Question;
  jenisSoal: readonly string[];
  describe: (state?: unknown) => string;
  ConceptExtra?: ComponentType;
}

