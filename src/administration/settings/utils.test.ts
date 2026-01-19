import { describe, expect, it } from 'vitest';

import { formatListFieldValue, parseListFieldValue } from './utils';

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
