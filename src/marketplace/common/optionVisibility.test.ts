import { describe, expect, it } from 'vitest';

import {
  getHiddenOptionKeys,
  omitHiddenOptionValues,
  optionValueMatches,
} from './optionVisibility';

const ACCOUNT_CHOICES = [
  'Own account',
  'Request a new account on behalf of the project',
];

const options: any = {
  velero_backups: { type: 'boolean', label: 'Velero backups' },
  velero_backups_account: {
    type: 'select_string',
    label: 'Velero account',
    choices: ACCOUNT_CHOICES,
    required: true,
    visible_if: { field: 'velero_backups', values: [true] },
  },
  bucket: {
    type: 'string',
    label: 'Bucket',
    visible_if: { field: 'velero_backups_account', values: ['Own account'] },
  },
  features: {
    type: 'select_string_multi',
    label: 'Features',
    choices: ['backup', 'monitoring', 'logging'],
  },
  retention: {
    type: 'integer',
    label: 'Retention',
    visible_if: { field: 'features', values: ['backup', 'logging'] },
  },
  plain: { type: 'string', label: 'Plain' },
};

describe('getHiddenOptionKeys', () => {
  it('hides dependent options while their parent has no value', () => {
    expect(getHiddenOptionKeys(options, {})).toEqual(
      new Set(['velero_backups_account', 'bucket', 'retention']),
    );
  });

  it('shows an option when a boolean parent is ticked', () => {
    const hidden = getHiddenOptionKeys(options, { velero_backups: true });
    expect(hidden.has('velero_backups_account')).toBe(false);
    expect(hidden.has('bucket')).toBe(true);
  });

  it('cascades hiding down a chain', () => {
    expect(
      getHiddenOptionKeys(options, {
        velero_backups: true,
        velero_backups_account: 'Own account',
      }).has('bucket'),
    ).toBe(false);
    expect(
      getHiddenOptionKeys(options, {
        velero_backups: false,
        velero_backups_account: 'Own account',
      }).has('bucket'),
    ).toBe(true);
  });

  it('shows a "show when unchecked" option on a fresh form', () => {
    const unchecked: any = {
      backups: { type: 'boolean', label: 'Backups' },
      reason: {
        type: 'string',
        label: 'Reason',
        visible_if: { field: 'backups', values: [false] },
      },
    };
    expect(getHiddenOptionKeys(unchecked, {}).has('reason')).toBe(false);
    expect(
      getHiddenOptionKeys(unchecked, { backups: true }).has('reason'),
    ).toBe(true);
  });

  it('matches a multi-select parent when any selected value is listed', () => {
    expect(
      getHiddenOptionKeys(options, { features: ['monitoring', 'logging'] }).has(
        'retention',
      ),
    ).toBe(false);
    expect(
      getHiddenOptionKeys(options, { features: ['monitoring'] }).has(
        'retention',
      ),
    ).toBe(true);
  });

  it('hides options with unknown or cyclic references', () => {
    const broken: any = {
      a: { type: 'boolean', visible_if: { field: 'b', values: [true] } },
      b: { type: 'boolean', visible_if: { field: 'a', values: [true] } },
      c: { type: 'boolean', visible_if: { field: 'missing', values: [true] } },
    };
    expect(getHiddenOptionKeys(broken, { a: true, b: true })).toEqual(
      new Set(['a', 'b', 'c']),
    );
  });

  it('returns an empty set for options without rules', () => {
    expect(getHiddenOptionKeys({ plain: options.plain }, {}).size).toBe(0);
    expect(getHiddenOptionKeys(undefined, {}).size).toBe(0);
  });
});

describe('optionValueMatches', () => {
  it('accepts string forms of booleans', () => {
    expect(optionValueMatches(options.velero_backups, 'true', [true])).toBe(
      true,
    );
    expect(optionValueMatches(options.velero_backups, false, [true])).toBe(
      false,
    );
  });

  it('treats a missing boolean as unchecked', () => {
    for (const missing of [undefined, null]) {
      expect(optionValueMatches(options.velero_backups, missing, [false])).toBe(
        true,
      );
      expect(optionValueMatches(options.velero_backups, missing, [true])).toBe(
        false,
      );
    }
  });

  it('does not match a select without a value', () => {
    expect(
      optionValueMatches(options.velero_backups_account, undefined, [
        'Own account',
      ]),
    ).toBe(false);
  });

  it('accepts select option objects', () => {
    expect(
      optionValueMatches(
        options.velero_backups_account,
        { value: 'Own account' },
        ['Own account'],
      ),
    ).toBe(true);
  });
});

describe('omitHiddenOptionValues', () => {
  it('drops values of hidden options and keeps the rest', () => {
    expect(
      omitHiddenOptionValues(options, {
        name: 'cluster',
        velero_backups: false,
        velero_backups_account: 'Own account',
      }),
    ).toEqual({ name: 'cluster', velero_backups: false });
  });

  it('returns the same object when nothing is hidden', () => {
    const values = { plain: 'x' };
    expect(omitHiddenOptionValues({ plain: options.plain }, values)).toBe(
      values,
    );
  });
});
