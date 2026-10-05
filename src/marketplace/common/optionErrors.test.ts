import { describe, expect, it } from 'vitest';

import { isUniqueOptionFieldType, splitOptionErrors } from './optionErrors';

describe('isUniqueOptionFieldType', () => {
  it('matches the types mastermind accepts', () => {
    for (const type of ['string', 'text', 'integer', 'select_string']) {
      expect(isUniqueOptionFieldType(type)).toBe(true);
    }
    for (const type of ['boolean', 'select_string_multi', 'money', undefined]) {
      expect(isUniqueOptionFieldType(type)).toBe(false);
    }
  });
});

describe('splitOptionErrors', () => {
  const taken = ['This value is already used by another resource.'];

  it('moves errors of option keys under attributes', () => {
    expect(
      splitOptionErrors({ bucket: taken, plan: ['Invalid plan.'] }, [
        'bucket',
        'notes',
      ]),
    ).toEqual({
      attributes: { bucket: taken },
      rest: { plan: ['Invalid plan.'] },
    });
  });

  it('handles an empty or missing body', () => {
    const empty = { attributes: {}, rest: {} };
    expect(splitOptionErrors(undefined, ['bucket'])).toEqual(empty);
    expect(splitOptionErrors({}, ['bucket'])).toEqual(empty);
  });
});
