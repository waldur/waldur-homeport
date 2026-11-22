import { describe, expect, it } from 'vitest';
import { getDateLocale } from 'waldur-i18n-runtime';

import { formatDay } from './format';

describe('formatDay', () => {
  it('shows a date-only string as that day, whatever the time zone', () => {
    const shown = formatDay('2026-11-22');
    const expected = new Date(2026, 10, 22).toLocaleDateString(
      getDateLocale(),
      {
        day: 'numeric',
        month: 'short',
      },
    );
    expect(shown).toBe(expected);
  });

  it('shows nothing for no date', () => {
    expect(formatDay(null)).toBeUndefined();
  });
});
