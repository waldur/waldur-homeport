import { describe, it, expect } from 'vitest';

import {
  formatFilesize,
  formatPhoneNumber,
  formatSnakeCase,
  listToDict,
  getUUID,
  pick,
  truncate,
  LATIN_NAME_PATTERN,
} from './utils';

describe('LATIN_NAME_PATTERN', () => {
  it('accepts a name starting with a digit (e.g. derived from slug "2go")', () => {
    expect(LATIN_NAME_PATTERN.test('2go-cluster-1')).toBe(true);
  });

  it('accepts a name starting with a letter', () => {
    expect(LATIN_NAME_PATTERN.test('go-cluster-1')).toBe(true);
  });

  it('rejects a name starting with a disallowed symbol', () => {
    expect(LATIN_NAME_PATTERN.test('-go')).toBe(false);
    expect(LATIN_NAME_PATTERN.test('#go')).toBe(false);
  });
});

describe('formatFilesize', () => {
  // https://opennode.atlassian.net/browse/WAL-378
  it('displays value in MB without any digits after comma if value < 1 GB', () => {
    expect(formatFilesize(700)).toBe('700 MB');
  });

  it('displays value in GB without any digits after comma if value < 1 TB', () => {
    expect(formatFilesize(900 * 1024)).toBe('900 GB');
  });

  it('displays value in TB with one digit after comma if value > 1 TB', () => {
    expect(formatFilesize(1.2 * 1024 * 1024)).toBe('1.2 TB');
  });

  it('rounds value down to lower level', () => {
    expect(formatFilesize(1.29 * 1024 * 1024)).toBe('1.2 TB');
  });
});

describe('formatSnakeCase', () => {
  it('converts camelCase to snake-case', () => {
    expect(formatSnakeCase('formatSnakeCase')).toBe('format-snake-case');
  });
});

describe('listToDict', () => {
  it('converts list to dict', () => {
    const fn = listToDict(
      (item) => item.name,
      (item) => item.usage,
    );
    const list = [
      {
        name: 'cpu',
        usage: 4,
      },
      {
        name: 'ram',
        usage: 4096,
      },
    ];
    expect(fn(list)).toEqual({
      cpu: 4,
      ram: 4096,
    });
  });
});

describe('getUUID', () => {
  it('extracts UUID from URL', () => {
    expect(getUUID('http://example.com/api/projects/uuid/')).toBe('uuid');
  });
});

describe('pick', () => {
  it('selects fields from object', () => {
    const source = { username: 'admin', password: 'secret', domain: 'default' };
    const fields = ['username', 'password'];
    const expected = { username: 'admin', password: 'secret' };
    const picker = pick(fields);
    expect(picker(source)).toEqual(expected);
  });
});

describe('truncate', () => {
  it('truncate long string', () => {
    expect(truncate('Academy of social and political sciences')).toEqual(
      'Academy of soc...ical sciences',
    );
  });
});

describe('formatPhoneNumber', () => {
  describe('with object input', () => {
    it('formats phone number with country code', () => {
      expect(
        formatPhoneNumber({
          country_code: '+1',
          national_number: '2025551234',
        }),
      ).toBe('+1 202 555 1234');
    });

    it('adds + prefix to country code if missing', () => {
      expect(
        formatPhoneNumber({
          country_code: '44',
          national_number: '7911123456',
        }),
      ).toBe('+44 791 112 3456');
    });

    it('formats phone number without country code', () => {
      expect(
        formatPhoneNumber({
          country_code: '',
          national_number: '5551234567',
        }),
      ).toBe('555 123 4567');
    });

    it('handles short national numbers', () => {
      expect(
        formatPhoneNumber({
          country_code: '+1',
          national_number: '5551234',
        }),
      ).toBe('+1 555 1234');
    });

    it('handles very short numbers', () => {
      expect(
        formatPhoneNumber({
          country_code: '+1',
          national_number: '1234',
        }),
      ).toBe('+1 1234');
    });

    it('handles long international numbers', () => {
      expect(
        formatPhoneNumber({
          country_code: '+49',
          national_number: '15123456789',
        }),
      ).toBe('+49 15 123 456 789');
    });
  });

  describe('with string input', () => {
    it('formats string with country code', () => {
      expect(formatPhoneNumber('+12025551234')).toBe('+1 202 555 1234');
    });

    it('formats string without country code', () => {
      expect(formatPhoneNumber('5551234567')).toBe('555 123 4567');
    });

    it('cleans up existing formatting', () => {
      expect(formatPhoneNumber('+1 (202) 555-1234')).toBe('+1 202 555 1234');
    });

    it('handles string with dots as separators', () => {
      expect(formatPhoneNumber('+1.202.555.1234')).toBe('+1 202 555 1234');
    });

    it('formats non-US international numbers', () => {
      expect(formatPhoneNumber('+447911123456')).toBe('+44 791 112 3456');
    });
  });

  describe('edge cases', () => {
    it('returns null for null input', () => {
      expect(formatPhoneNumber(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(formatPhoneNumber(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(formatPhoneNumber('')).toBeNull();
    });

    it('returns null for whitespace only', () => {
      expect(formatPhoneNumber('   ')).toBeNull();
    });

    it('returns country code only if national number is empty', () => {
      expect(
        formatPhoneNumber({
          country_code: '+1',
          national_number: '',
        }),
      ).toBe('+1');
    });
  });
});
