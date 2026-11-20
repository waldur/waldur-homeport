import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageUtilsService } from 'waldur-i18n-runtime';

import { formatDate, formatRelative } from './format';

describe('provider-calls date formatting', () => {
  afterEach(() => {
    vi.useRealTimers();
    LanguageUtilsService.currentLanguage = undefined;
  });

  it('formats in the app language, day-first in English', () => {
    LanguageUtilsService.currentLanguage = { code: 'en', label: 'English' };
    expect(formatDate('2027-02-26')).toBe('26 Feb 2027');
    LanguageUtilsService.currentLanguage = { code: 'fi', label: 'Suomi' };
    expect(formatDate('2027-02-26')).toBe('26.2.2027');
  });

  it('keeps a date-only value on its own day', () => {
    // As UTC midnight this was the 25th anywhere west of UTC.
    expect(formatDate('2027-02-26')).toContain('26');
  });

  it('counts whole calendar days to a due date', () => {
    vi.setSystemTime(new Date(2026, 8, 1, 23, 30));
    expect(formatRelative('2026-09-04')).toBe('in 3 days');
    expect(formatRelative('2026-09-02')).toBe('tomorrow');
    expect(formatRelative('2026-09-01')).toBe('today');
  });

  it('shows a dash for a missing or unparseable date', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('not a date')).toBe('—');
    expect(formatRelative(undefined)).toBe('—');
  });
});
