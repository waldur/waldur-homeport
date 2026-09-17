import { describe, expect, it } from 'vitest';

import {
  getDependentOptions,
  getVisibleIfCandidates,
  validateOptionForm,
} from './validation';

describe('Option form validation', () => {
  describe('inode multiplier validation', () => {
    const allValuesOK = {
      type: { value: 'storage_folder_manager' },
      storage_folder_config: {
        inode_soft_multiplier: '1000',
        inode_hard_multiplier: '1000',
      },
    };
    const allValuesInvalid = {
      type: { value: 'storage_folder_manager' },
      storage_folder_config: {
        inode_soft_multiplier: '2000',
        inode_hard_multiplier: '1000',
      },
    };

    it('returns error when hard multiplier is less than soft multiplier', () => {
      const result = validateOptionForm(allValuesInvalid);
      expect(result).toEqual({
        storage_folder_config: {
          inode_hard_multiplier:
            'Hard inode multiplier cannot be less than soft inode multiplier',
        },
      });
    });

    it('returns empty object when hard multiplier is equal to soft multiplier', () => {
      const result = validateOptionForm(allValuesOK);
      expect(result).toEqual({});
    });

    it('returns empty object when hard multiplier is greater than soft multiplier', () => {
      const allValuesGreater = {
        ...allValuesOK,
        storage_folder_config: {
          inode_soft_multiplier: '1000',
          inode_hard_multiplier: '3000',
        },
      };
      const result = validateOptionForm(allValuesGreater);
      expect(result).toEqual({});
    });

    it('returns empty object when not storage_folder_manager type', () => {
      const result = validateOptionForm({ type: { value: 'other' } });
      expect(result).toEqual({});
    });
  });

  describe('visible_if rule', () => {
    const options: any = {
      order: ['kind', 'backups', 'features', 'account', 'size'],
      options: {
        kind: { type: 'string', label: 'Kind' },
        backups: { type: 'boolean', label: 'Backups' },
        features: {
          type: 'select_string_multi',
          label: 'Features',
          choices: ['a', 'b'],
        },
        account: {
          type: 'select_string',
          label: 'Account',
          choices: ['own', 'new'],
        },
        size: { type: 'integer', label: 'Size' },
      },
    };
    const context = { options, optionKey: 'account' };
    const validate = (visible_if, ctx: any = context) =>
      validateOptionForm({ type: { value: 'string' }, visible_if }, ctx);

    it('offers only earlier options of supported types', () => {
      expect(getVisibleIfCandidates(options, 'account')).toEqual([
        'backups',
        'features',
      ]);
      expect(getVisibleIfCandidates(options, 'backups')).toEqual([]);
      // A new option is appended, so every supported option is earlier.
      expect(getVisibleIfCandidates(options)).toEqual([
        'backups',
        'features',
        'account',
      ]);
      expect(getVisibleIfCandidates(undefined)).toEqual([]);
    });

    it('accepts a missing rule', () => {
      expect(validate(undefined)).toEqual({});
    });

    it('accepts valid rules', () => {
      expect(validate({ field: 'backups', values: [true] })).toEqual({});
      expect(validate({ field: 'features', values: ['a', 'b'] })).toEqual({});
    });

    it('requires a referenced option', () => {
      expect(validate({ values: [true] }).visible_if.field).toBeDefined();
    });

    it('rejects unknown, later and unsupported options', () => {
      for (const field of ['missing', 'size', 'kind', 'account']) {
        expect(validate({ field, values: ['own'] }).visible_if.field).toBe(
          'The option must be an earlier boolean or select option.',
        );
      }
    });

    it('requires at least one value', () => {
      expect(validate({ field: 'backups', values: [] }).visible_if).toEqual({
        values: 'Select at least one value.',
      });
    });

    it('rejects values that do not fit the referenced option', () => {
      const error = {
        values: 'Values must be valid for the selected option.',
      };
      expect(
        validate({ field: 'backups', values: ['true'] }).visible_if,
      ).toEqual(error);
      expect(validate({ field: 'features', values: ['c'] }).visible_if).toEqual(
        error,
      );
      expect(
        validate({ field: 'features', values: [true] }).visible_if,
      ).toEqual(error);
    });
  });

  describe('options that other rules depend on', () => {
    const options: any = {
      order: ['backups', 'account', 'reason', 'tier', 'size'],
      options: {
        backups: { type: 'boolean', label: 'Backups' },
        account: {
          type: 'string',
          label: 'Account',
          visible_if: { field: 'backups', values: [true] },
        },
        reason: {
          type: 'string',
          visible_if: { field: 'backups', values: [false] },
        },
        tier: {
          type: 'select_string',
          label: 'Tier',
          choices: ['basic', 'premium'],
        },
        size: {
          type: 'integer',
          label: 'Size',
          visible_if: { field: 'tier', values: ['premium'] },
        },
      },
    };
    const message =
      'Remove the "Show only when" rule from: Account, reason first.';

    it('lists dependent options', () => {
      expect(getDependentOptions(options, 'backups').map((d) => d.key)).toEqual(
        ['account', 'reason'],
      );
      expect(getDependentOptions(options, 'size')).toEqual([]);
      expect(getDependentOptions(undefined, 'size')).toEqual([]);
    });

    it('blocks a type change that breaks dependent rules', () => {
      const context = { options, optionKey: 'backups' };
      expect(
        validateOptionForm({ type: { value: 'string' } }, context).dependents,
      ).toBe(message);
      expect(
        validateOptionForm(
          { type: { value: 'select_string' }, choices: 'true, false' },
          context,
        ).dependents,
      ).toBe(message);
      expect(
        validateOptionForm({ type: { value: 'boolean' } }, context),
      ).toEqual({});
    });

    it('blocks removing a choice that a rule refers to', () => {
      const context = { options, optionKey: 'tier' };
      expect(
        validateOptionForm(
          { type: { value: 'select_string' }, choices: 'basic' },
          context,
        ).dependents,
      ).toBe('Remove the "Show only when" rule from: Size first.');
      expect(
        validateOptionForm(
          { type: { value: 'select_string_multi' }, choices: 'premium, gold' },
          context,
        ),
      ).toEqual({});
    });

    it('does not check dependents of a new option', () => {
      expect(
        validateOptionForm({ type: { value: 'string' } }, { options }),
      ).toEqual({});
    });
  });
});
