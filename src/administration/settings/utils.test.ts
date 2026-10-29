import { describe, expect, it } from 'vitest';

import {
  formatDefaultValue,
  formatListFieldValue,
  isSettingModified,
  parseListFieldValue,
} from './utils';

describe('parseListFieldValue', () => {
  it('parses comma-separated numbers into array of numbers', () => {
    expect(parseListFieldValue('30,14,7,1')).toEqual([30, 14, 7, 1]);
  });

  it('handles spaces around values', () => {
    expect(parseListFieldValue('30, 14, 7, 1')).toEqual([30, 14, 7, 1]);
    expect(parseListFieldValue(' 30 , 14 , 7 , 1 ')).toEqual([30, 14, 7, 1]);
  });

  it('parses string values and keeps them as strings', () => {
    expect(parseListFieldValue('root,admin,test')).toEqual([
      'root',
      'admin',
      'test',
    ]);
  });

  it('handles mixed string and number values', () => {
    expect(parseListFieldValue('root,123,admin,456')).toEqual([
      'root',
      123,
      'admin',
      456,
    ]);
  });

  it('filters out empty values', () => {
    expect(parseListFieldValue('30,,14,7,')).toEqual([30, 14, 7]);
    expect(parseListFieldValue(',,')).toEqual([]);
  });

  it('handles empty string input', () => {
    expect(parseListFieldValue('')).toEqual([]);
  });

  it('handles single value', () => {
    expect(parseListFieldValue('30')).toEqual([30]);
    expect(parseListFieldValue('root')).toEqual(['root']);
  });

  it('handles decimal numbers', () => {
    expect(parseListFieldValue('1.5,2.7,3')).toEqual([1.5, 2.7, 3]);
  });

  it('handles negative numbers', () => {
    expect(parseListFieldValue('-1,0,1')).toEqual([-1, 0, 1]);
  });

  it('keeps non-numeric strings as strings', () => {
    expect(parseListFieldValue('AdminAnnouncement,BroadcastMessage')).toEqual([
      'AdminAnnouncement',
      'BroadcastMessage',
    ]);
  });
});

describe('formatListFieldValue', () => {
  it('formats array of numbers to comma-separated string', () => {
    expect(formatListFieldValue([30, 14, 7, 1])).toBe('30, 14, 7, 1');
  });

  it('formats array of strings to comma-separated string', () => {
    expect(formatListFieldValue(['root', 'admin'])).toBe('root, admin');
  });

  it('formats mixed array to comma-separated string', () => {
    expect(formatListFieldValue(['root', 123, 'admin'])).toBe(
      'root, 123, admin',
    );
  });

  it('handles empty array', () => {
    expect(formatListFieldValue([])).toBe('');
  });

  it('handles single element array', () => {
    expect(formatListFieldValue([30])).toBe('30');
    expect(formatListFieldValue(['root'])).toBe('root');
  });
});

describe('isSettingModified', () => {
  it('returns false when value matches default across types', () => {
    expect(
      isSettingModified({ default: 'Waldur', type: 'string' }, 'Waldur'),
    ).toBe(false);
    expect(isSettingModified({ default: '', type: 'string' }, ' ')).toBe(false);
    expect(isSettingModified({ default: true, type: 'boolean' }, true)).toBe(
      false,
    );
    expect(isSettingModified({ default: 90, type: 'integer' }, 90)).toBe(false);
    expect(
      isSettingModified({ default: ['EE', 'FI'], type: 'country_list_field' }, [
        'EE',
        'FI',
      ]),
    ).toBe(false);
  });

  it('returns true when value differs from default', () => {
    expect(
      isSettingModified({ default: 'Waldur', type: 'string' }, 'My Cloud'),
    ).toBe(true);
    expect(isSettingModified({ default: false, type: 'boolean' }, true)).toBe(
      true,
    );
    expect(isSettingModified({ default: 90, type: 'integer' }, 80)).toBe(true);
    expect(
      isSettingModified({ default: ['EE'], type: 'country_list_field' }, [
        'EE',
        'FI',
      ]),
    ).toBe(true);
  });

  it('compares a list edited as comma-separated text with its default', () => {
    expect(isSettingModified({ default: [], type: 'list_field' }, '')).toBe(
      false,
    );
    expect(
      isSettingModified({ default: [30, 14], type: 'list_field' }, '30, 14'),
    ).toBe(false);
    expect(
      isSettingModified({ default: ['root'], type: 'list_field' }, 'root, ec2'),
    ).toBe(true);
  });

  it('ignores secrets that were blanked for a non-staff viewer', () => {
    const item = { default: 'secret', type: 'secret_field' };
    expect(isSettingModified(item, '', { secretsRedacted: true })).toBe(false);
    expect(isSettingModified(item, '')).toBe(true);
    expect(isSettingModified(item, 'secret')).toBe(false);
  });

  it('returns false when value or default is undefined/null', () => {
    expect(isSettingModified({ default: 'Waldur' }, undefined)).toBe(false);
    expect(isSettingModified({ default: 'Waldur' }, null)).toBe(false);
    expect(isSettingModified({}, 'Waldur')).toBe(false);
  });
});

describe('formatDefaultValue', () => {
  it('formats boolean, choice, string, and empty defaults', () => {
    expect(formatDefaultValue({ default: true, type: 'boolean' })).toBe('Yes');
    expect(formatDefaultValue({ default: false, type: 'boolean' })).toBe('No');
    expect(formatDefaultValue({ default: '', type: 'string' })).toBe('Empty');
    expect(
      formatDefaultValue({
        default: 'classic',
        type: 'choice_field',
        options: [{ value: 'classic', label: 'Classic' }],
      }),
    ).toBe('Classic');
  });
});
