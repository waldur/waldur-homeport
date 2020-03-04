import * as dateUtils from './dateUtils';

describe('dateUtils', () => {
  it('formats date given as ISO 8601 timestamp', () => {
    expect(dateUtils.formatDate('2018-01-01T01:01:10.618Z')).toBe('2018-01-01');
  });

  it('formats date and time given as string', () => {
    expect(dateUtils.formatDateTime('2018-01-01')).toBe('2018-01-01 00:00');
  });

  it('formats relative date given as Date object', () => {
    expect(dateUtils.formatFromNow(new Date())).toBe('a few seconds ago');
  });

  it('strips suffix for relative date formatting', () => {
    expect(dateUtils.formatRelative(new Date())).toBe('a few seconds');
  });

  it('formats medium date and time given a date-only string', () => {
    expect(dateUtils.formatMediumDateTime('2014-12-21')).toEqual(
      'Dec 21, 2014 12:00:00 AM',
    );
  });
});
