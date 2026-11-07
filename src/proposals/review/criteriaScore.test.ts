import { describe, expect, it } from 'vitest';

import {
  criterionLabel,
  criterionShare,
  hasUnequalWeights,
  weightedOverall,
} from './criteriaScore';

const merit = { name: 'Merit', weight: 3 };
const impact = { name: 'Impact', weight: 1 };

describe('criteriaScore', () => {
  it('reads a missing or empty weight as 1', () => {
    expect(hasUnequalWeights([{ name: 'A' }, { name: 'B', weight: 1 }])).toBe(
      false,
    );
    expect(hasUnequalWeights([{ name: 'A', weight: '' }, merit])).toBe(true);
  });

  it('gives each criterion its share of the weight', () => {
    expect(criterionShare(merit, [merit, impact])).toBe(75);
    expect(criterionShare(impact, [merit, impact])).toBe(25);
  });

  it('names the share only when the criteria weigh differently', () => {
    expect(criterionLabel(merit, [merit, impact])).toBe('Merit (75%)');
    expect(criterionLabel({ name: 'Merit' }, [{ name: 'Merit' }])).toBe(
      'Merit',
    );
  });

  it('averages by weight and rounds half up, as the backend does', () => {
    const scores = { Merit: 5, Impact: 1 };
    expect(weightedOverall([merit, impact], (c) => scores[c.name])).toBe(4);
    // (3 * 4 + 2) / 4 = 3.5
    expect(
      weightedOverall(
        [merit, impact],
        (c) => ({ Merit: 4, Impact: 2 })[c.name],
      ),
    ).toBe(4);
  });

  it('leaves unscored criteria out, and is null until one is scored', () => {
    expect(
      weightedOverall([merit, impact], (c) => (c === impact ? 2 : null)),
    ).toBe(2);
    expect(weightedOverall([merit, impact], () => undefined)).toBeNull();
  });
});
