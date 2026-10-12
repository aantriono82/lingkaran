import { describe, expect, it } from 'vitest';
import { petaMiniatur } from './index';
import { TOPIC_IDS } from '../../types';

describe('peta miniatur SVG khas 10 topik', () => {
  it('memiliki entri miniatur valid untuk setiap dari 10 topik', () => {
    expect(Object.keys(petaMiniatur)).toHaveLength(10);
    for (const id of TOPIC_IDS) {
      expect(petaMiniatur[id]).toBeDefined();
      expect(typeof petaMiniatur[id]).toBe('function');
    }
  });

  it('setiap miniatur mengembalikan elemen SVG dengan aria-hidden', () => {
    for (const id of TOPIC_IDS) {
      const Komponen = petaMiniatur[id];
      const vnode = Komponen();
      expect(vnode).toBeDefined();

      expect(vnode.type).toBe('svg');
      expect(vnode.props['aria-hidden']).toBe('true');
      expect(vnode.props.className).toContain('card-svg-preview');
      expect(vnode.props.viewBox).toBe('0 0 240 120');
    }
  });
});
