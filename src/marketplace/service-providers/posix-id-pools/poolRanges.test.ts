import { describe, expect, it } from 'vitest';

import { buildPoolValidator, roundUtilization } from './poolRanges';

const providerPool = {
  uuid: 'provider-pool',
  customer_uuid: 'customer',
  scope: 'service_provider',
  min_uid: 9000,
  max_uid: 9019,
  min_gid: 9000,
  max_gid: 9019,
} as any;

describe('buildPoolValidator', () => {
  const validate = buildPoolValidator([providerPool]);

  it('accepts a range clear of the other pools', () => {
    expect(validate({ min_uid: 20000, max_uid: 20999 })).toEqual({});
  });

  it('refuses a range overlapping another pool of the provider', () => {
    expect(validate({ min_uid: 9010, max_uid: 9100 }).min_uid).toMatch(
      /Overlaps 9000–9019/,
    );
  });

  it('lets a UID range reuse numbers of a GID range', () => {
    const gidOnly = buildPoolValidator([
      { ...providerPool, min_uid: null, max_uid: null },
    ]);
    expect(gidOnly({ min_uid: 9000, max_uid: 9019 })).toEqual({});
  });

  it('refuses values outside the allowed bounds', () => {
    expect(validate({ min_uid: 999, max_uid: 1500 }).min_uid).toMatch(
      /from 1000 to 4294967294/,
    );
    expect(validate({ min_uid: 5000, max_uid: 4294967295 }).max_uid).toMatch(
      /from 1000 to 4294967294/,
    );
  });

  it('refuses a maximum below the minimum', () => {
    expect(validate({ min_uid: 30000, max_uid: 20000 }).max_uid).toMatch(
      /must not be below the minimum/,
    );
  });

  it('asks for both ends of a range', () => {
    expect(validate({ min_gid: 30000 }).max_gid).toMatch(/both/);
  });

  it('compares typed values as numbers', () => {
    expect(validate({ min_uid: '20000', max_uid: '100000' } as any)).toEqual(
      {},
    );
    expect(validate({ min_uid: '', max_uid: '' } as any).min_uid).toMatch(
      /at least one/,
    );
  });

  it('asks for at least one range', () => {
    expect(validate({}).min_uid).toMatch(/at least one/);
  });

  describe('group GID range', () => {
    it('accepts a group range clear of every GID range', () => {
      expect(
        validate({
          min_gid: 20000,
          max_gid: 20999,
          min_group_gid: 30000,
          max_group_gid: 30199,
        }),
      ).toEqual({});
    });

    it('refuses a group range overlapping the pool’s own GID range', () => {
      expect(
        validate({
          min_gid: 20000,
          max_gid: 20999,
          min_group_gid: 20500,
          max_group_gid: 21500,
        }).min_group_gid,
      ).toMatch(/this pool’s GID range 20000–20999/);
    });

    it('refuses a group range overlapping another pool’s GID range', () => {
      expect(
        validate({
          min_uid: 20000,
          max_uid: 20999,
          min_group_gid: 9010,
          max_group_gid: 9100,
        }).min_group_gid,
      ).toMatch(/Overlaps 9000–9019/);
    });

    it('refuses a GID range overlapping another pool’s group range', () => {
      const withGroups = buildPoolValidator([
        { ...providerPool, min_group_gid: 40000, max_group_gid: 40199 },
      ]);
      expect(withGroups({ min_gid: 40100, max_gid: 40300 }).min_gid).toMatch(
        /Overlaps 40000–40199/,
      );
    });

    it('lets a UID range reuse numbers of a group range', () => {
      const withGroups = buildPoolValidator([
        { ...providerPool, min_group_gid: 40000, max_group_gid: 40199 },
      ]);
      expect(withGroups({ min_uid: 40000, max_uid: 40199 })).toEqual({});
    });

    it('asks for both ends of the group range', () => {
      expect(
        validate({ min_uid: 20000, max_uid: 20999, min_group_gid: 30000 })
          .max_group_gid,
      ).toMatch(/both/);
    });

    it('ignores a group range typed before switching to an offering pool', () => {
      expect(
        validate({
          scope: 'offering',
          min_uid: 20000,
          max_uid: 20999,
          min_group_gid: 9010,
        }),
      ).toEqual({});
    });

    it('does not count a group range alone as a pool', () => {
      expect(
        validate({ min_group_gid: 30000, max_group_gid: 30199 }).min_uid,
      ).toMatch(/at least one/);
    });
  });
});

describe('roundUtilization', () => {
  it('keeps one decimal at most', () => {
    expect(roundUtilization(0.04)).toBe(0);
    expect(roundUtilization(4)).toBe(4);
    expect(roundUtilization(33.333)).toBe(33.3);
    expect(roundUtilization(null)).toBe(0);
  });
});
