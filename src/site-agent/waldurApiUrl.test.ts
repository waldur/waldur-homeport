import { describe, expect, it } from 'vitest';

import { waldurApiUrl } from './waldurApiUrl';

describe('waldurApiUrl', () => {
  it('is absolute when the API is served from the page origin', () => {
    expect(waldurApiUrl('', '/', 'https://portal.example.com')).toBe(
      'https://portal.example.com/api/',
    );
  });

  it('keeps the host and path of a configured API endpoint', () => {
    expect(
      waldurApiUrl('users/', 'https://api.example.com/waldur', 'https://x'),
    ).toBe('https://api.example.com/waldur/api/users/');
  });
});
