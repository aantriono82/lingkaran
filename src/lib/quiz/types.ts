export type JenisSoal = 'numerik' | 'pilihan';

export type GeometrySource = Record<string, number | string>;

export interface Question {
  pertanyaan: string;
  jenis: JenisSoal;
  pilihan?: string[];
  jawabanBenar: number | string;
  toleransi?: number;
  pembahasan: string;
  data?: Record<string, number | string>;
  sumberGeometri?: GeometrySource;
}
