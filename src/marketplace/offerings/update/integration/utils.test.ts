import { describe, expect, it } from 'vitest';

import { mergeBackendIdRules } from './utils';

describe('mergeBackendIdRules', () => {
  const current = {
    format: { regex: '^[A-Z]{2}$', error: 'Two capitals' },
    uniqueness: { scope: 'offering', include_terminated: true },
  };

  it('keeps the other groups when one group is edited', () => {
    expect(
      mergeBackendIdRules(current, { uniqueness: { scope: 'customer' } }),
    ).toEqual({
      format: { regex: '^[A-Z]{2}$', error: 'Two capitals' },
      uniqueness: { scope: 'customer', include_terminated: true },
    });
  });

  it('keeps sibling keys in the group that is edited', () => {
    expect(
      mergeBackendIdRules(current, { format: { regex: '^[0-9]+$' } }),
    ).toEqual({
      format: { regex: '^[0-9]+$', error: 'Two capitals' },
      uniqueness: { scope: 'offering', include_terminated: true },
    });
  });

  it('does not change the offering’s current rules', () => {
    mergeBackendIdRules(current, { format: { regex: '^[0-9]+$' } });

    expect(current.format.regex).toBe('^[A-Z]{2}$');
  });

  it('starts from no rules when the offering has none', () => {
    expect(
      mergeBackendIdRules(undefined, { format: { regex: '^x$' } }),
    ).toEqual({ format: { regex: '^x$' } });
    expect(mergeBackendIdRules(current, undefined)).toEqual(current);
  });
});
