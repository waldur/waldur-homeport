import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import {
  buildSiteAgentTokenConfig,
  getAbsoluteApiUrl,
} from './siteAgentTokenConfig';

describe('getAbsoluteApiUrl', () => {
  let apiEndpoint: string;

  beforeEach(() => {
    apiEndpoint = ENV.apiEndpoint;
  });

  afterEach(() => {
    ENV.apiEndpoint = apiEndpoint;
  });

  it('resolves an API served from the frontend host against the page origin', () => {
    // A site agent on a cluster cannot use "/api/".
    ENV.apiEndpoint = '';
    expect(getAbsoluteApiUrl()).toBe(`${window.location.origin}/api/`);
    ENV.apiEndpoint = '/';
    expect(getAbsoluteApiUrl()).toBe(`${window.location.origin}/api/`);
  });

  it('keeps an API on its own host', () => {
    ENV.apiEndpoint = 'https://api.example.org/';
    expect(getAbsoluteApiUrl()).toBe('https://api.example.org/api/');
  });
});

describe('buildSiteAgentTokenConfig', () => {
  it('writes the given values as quoted YAML scalars', () => {
    const config = buildSiteAgentTokenConfig({
      token: 'w_1_secret',
      apiUrl: 'https://api.example.org/api/',
      offering: { uuid: 'abc', name: 'Cluster: "A"' },
    });
    expect(config).toContain('waldur_api_url: "https://api.example.org/api/"');
    expect(config).toContain('waldur_api_token: "w_1_secret"');
    expect(config).toContain('name: "Cluster: \\"A\\""');
    expect(config).toContain('waldur_offering_uuid: "abc"');
  });
});
