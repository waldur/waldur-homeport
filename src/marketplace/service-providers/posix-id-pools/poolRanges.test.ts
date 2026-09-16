import { describe, expect, it } from 'vitest';

import { buildPoolValidator } from './poolRanges';

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

  it('asks for at least one range', () => {
    expect(validate({}).min_uid).toMatch(/at least one/);
  });
});
