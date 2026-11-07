import { describe, expect, it } from 'vitest';
import { AwardedResource } from 'waldur-js-client';

import { getAwardPrefillPatches, isRankingLocked } from './rankings';

const award = (
  uuid: string,
  offeringUuid: string,
  limits: Record<string, number> = {},
) =>
  ({
    uuid,
    requested_offering: { uuid: offeringUuid },
    limits,
  }) as unknown as AwardedResource;

describe('isRankingLocked', () => {
  it('is open while the round is evaluated', () => {
    expect(isRankingLocked('evaluating')).toBe(false);
    expect(isRankingLocked(undefined)).toBe(false);
  });

  it('is fixed once the round goes to its decision', () => {
    expect(isRankingLocked('deciding')).toBe(true);
    expect(isRankingLocked('results_published')).toBe(true);
    expect(isRankingLocked('closed')).toBe(true);
  });
});

describe('getAwardPrefillPatches', () => {
  it('sets the recommended amounts and keeps the other components', () => {
    const patches = getAwardPrefillPatches(
      [award('a1', 'o1', { cpu: 10, storage: 5 })],
      { o1: { cpu: 80 } },
    );
    expect(patches).toHaveLength(1);
    expect(patches[0].awarded.uuid).toBe('a1');
    expect(patches[0].limits).toEqual({ cpu: 80, storage: 5 });
  });

  it('leaves out items that already match', () => {
    expect(
      getAwardPrefillPatches([award('a1', 'o1', { cpu: 80 })], {
        o1: { cpu: 80 },
      }),
    ).toEqual([]);
  });

  it('removes the item of an offering recommended nothing', () => {
    const patches = getAwardPrefillPatches(
      [award('a1', 'o1', { cpu: 10 }), award('a2', 'o2', { gpu: 4 })],
      { o1: { cpu: 80 }, o2: { gpu: 0 } },
    );
    expect(
      patches.map((patch) => [patch.awarded.uuid, !!patch.remove]),
    ).toEqual([
      ['a1', false],
      ['a2', true],
    ]);
  });

  it('fills only the first item of each offering', () => {
    const patches = getAwardPrefillPatches(
      [award('a1', 'o1'), award('a2', 'o1'), award('a3', 'o2')],
      { o1: { cpu: 1 } },
    );
    expect(patches.map((patch) => patch.awarded.uuid)).toEqual(['a1']);
  });
});
