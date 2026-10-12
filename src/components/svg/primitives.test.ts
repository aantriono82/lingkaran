import { describe, expect, it } from 'vitest';
import primitivesSource from './Primitives.tsx?raw';
import draggableSource from './DraggablePoint.tsx?raw';

describe('primitif SVG dan kepatuhan skala garis IFP', () => {
  it('Primitives.tsx menggunakan useIfp dan mengalikan ukuran dengan skalaGaris', () => {
    expect(primitivesSource).toContain('useIfp()');
    expect(primitivesSource).toContain('skalaGaris');
    expect(primitivesSource).toContain('strokeWidth={tebal * skalaGaris}');
    expect(primitivesSource).toContain('LandmarkPoint');
    expect(primitivesSource).toContain('r={r * skalaGaris}');
    expect(primitivesSource).toContain('strokeWidth={3 * skalaGaris}');
  });

  it('DraggablePoint.tsx menggunakan useIfp dan menskalakan hit-area serta visual lingkaran', () => {
    expect(draggableSource).toContain('useIfp()');
    expect(draggableSource).toContain('skalaGaris');
    expect(draggableSource).toContain('r={46 * skalaGaris}');
    expect(draggableSource).toContain('r={10 * skalaGaris}');
    expect(draggableSource).toContain('strokeWidth={4 * skalaGaris}');
  });
});
