import { describe, it, expect } from 'vitest';

import { serializeNotificationEmails } from './utils';

describe('serializeNotificationEmails', () => {
  it('joins an array of addresses into a comma-separated string', () => {
    expect(
      serializeNotificationEmails(['a@example.org', 'b@example.org']),
    ).toBe('a@example.org,b@example.org');
  });

  it('trims whitespace and drops empty entries', () => {
    expect(
      serializeNotificationEmails([
        ' a@example.org ',
        '',
        '   ',
        'b@example.org',
      ]),
    ).toBe('a@example.org,b@example.org');
  });

  it('returns an empty string for an empty array', () => {
    expect(serializeNotificationEmails([])).toBe('');
  });

  it('passes through an existing comma-separated string unchanged', () => {
    expect(serializeNotificationEmails('a@example.org,b@example.org')).toBe(
      'a@example.org,b@example.org',
    );
  });

  it('returns undefined when the field is not present', () => {
    expect(serializeNotificationEmails(undefined)).toBeUndefined();
  });
});
