import { memo, type ReactNode } from 'react';

interface PiProps {
  svg?: boolean;
}

export const Pi = memo(function Pi({ svg = false }: PiProps) {
  return svg
    ? <tspan className="pi-symbol" aria-label="pi">π</tspan>
    : <span className="pi-symbol" aria-label="pi">π</span>;
});

export const PiText = memo(function PiText({ text }: { text: string }): ReactNode {
  const bagian = text.split('π');
  return bagian.map((potongan, indeks) => (
    <span key={`${potongan}-${indeks}`}>{potongan}{indeks < bagian.length - 1 && <Pi />}</span>
  ));
});
