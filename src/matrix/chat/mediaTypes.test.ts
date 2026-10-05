import { describe, expect, it } from 'vitest';

import { inlineSafeType } from './mediaTypes';

describe('inlineSafeType', () => {
  it.each([
    ['image/png', 'image/png'],
    ['image/jpeg', 'image/jpeg'],
    ['video/mp4', 'video/mp4'],
    ['audio/webm;codecs=opus', 'audio/webm'],
    ['Audio/MPEG', 'audio/mpeg'],
  ])('keeps %s, which renders inertly, as %s', (type, expected) => {
    expect(inlineSafeType(type)).toBe(expected);
  });

  it.each([
    'text/html',
    'image/svg+xml',
    'application/xhtml+xml',
    'text/xml',
    '',
    // A browser reads a comma as a list of types and takes the last one.
    'image/png;a=b,text/html',
    'image/png, text/html',
  ])('turns %s into a download', (type) => {
    expect(inlineSafeType(type)).toBe('application/octet-stream');
  });
});
