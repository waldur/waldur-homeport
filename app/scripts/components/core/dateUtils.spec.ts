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
    expect(dateUtils.formatMediumDateTime('2014-12-21')).toEqual('Dec 21, 2014 12:00:00 AM');
  });

  it('format functions return undefined in response to empty input', () => {
    expect(dateUtils.formatFromNow(undefined)).toBeUndefined();
    expect(dateUtils.formatFromNow('')).toBeUndefined();
    expect(dateUtils.formatFromNow(null)).toBeUndefined();

    expect(dateUtils.formatRelative(undefined)).toBeUndefined();
    expect(dateUtils.formatRelative('')).toBeUndefined();
    expect(dateUtils.formatRelative(null)).toBeUndefined();

    expect(dateUtils.formatDate(undefined)).toBeUndefined();
    expect(dateUtils.formatDate('')).toBeUndefined();
    expect(dateUtils.formatDate(null)).toBeUndefined();

    expect(dateUtils.formatDateTime(undefined)).toBeUndefined();
    expect(dateUtils.formatDateTime('')).toBeUndefined();
    expect(dateUtils.formatDateTime(null)).toBeUndefined();

    expect(dateUtils.formatMediumDateTime(undefined)).toBeUndefined();
    expect(dateUtils.formatMediumDateTime('')).toBeUndefined();
    expect(dateUtils.formatMediumDateTime(null)).toBeUndefined();
  });

});
