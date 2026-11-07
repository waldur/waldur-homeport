import { afterEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { resolveFileUrl } from './resolveFileUrl';

describe('resolveFileUrl', () => {
  const endpoint = ENV.apiEndpoint;
  afterEach(() => {
    ENV.apiEndpoint = endpoint;
  });

  it("fetches a file the API linked on its proxy's upstream from the SPA's origin", () => {
    ENV.apiEndpoint = '/';
    expect(resolveFileUrl('http://localhost:20310/api/media/abc/')).toBe(
      `${window.location.origin}/api/media/abc/`,
    );
  });

  it('makes a relative API path absolute, so the request helper does not prefix it again', () => {
    ENV.apiEndpoint = '/';
    expect(resolveFileUrl('/api/media/abc/')).toBe(
      `${window.location.origin}/api/media/abc/`,
    );
  });

  it('leaves links alone where the API has an absolute endpoint', () => {
    ENV.apiEndpoint = 'https://api.example.org/';
    expect(resolveFileUrl('https://api.example.org/api/media/abc/')).toBe(
      'https://api.example.org/api/media/abc/',
    );
  });

  it('leaves links outside the API alone', () => {
    ENV.apiEndpoint = '/';
    expect(resolveFileUrl('https://cdn.example.org/logo.png')).toBe(
      'https://cdn.example.org/logo.png',
    );
  });
});
