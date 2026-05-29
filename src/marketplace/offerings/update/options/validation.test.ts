import { describe, expect, it } from 'vitest';

import { validateOptionForm } from './validation';

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
});
