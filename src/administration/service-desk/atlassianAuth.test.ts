import { describe, expect, it, vi } from 'vitest';

import {
  AUTH_METHOD_FIELD,
  getAtlassianAuthMethod,
  getAtlassianSiteName,
  prepareAtlassianSettings,
  prepareAtlassianSubmission,
} from './atlassianAuth';

vi.mock('@/SettingsDescription', () => ({
  SettingsDescription: [
    {
      description: 'Atlassian settings',
      items: [
        { key: 'ATLASSIAN_API_URL', default: 'https://example.com/' },
        { key: 'ATLASSIAN_USERNAME', default: 'USERNAME' },
        { key: 'ATLASSIAN_PASSWORD', default: 'PASSWORD' },
        { key: 'ATLASSIAN_EMAIL', default: '' },
        { key: 'ATLASSIAN_TOKEN', default: '' },
        { key: 'ATLASSIAN_PERSONAL_ACCESS_TOKEN', default: '' },
        { key: 'ATLASSIAN_OAUTH2_CLIENT_ID', default: '' },
        { key: 'ATLASSIAN_OAUTH2_CLIENT_SECRET', default: '' },
        { key: 'ATLASSIAN_OAUTH2_ACCESS_TOKEN', default: '' },
        { key: 'ATLASSIAN_OAUTH2_TOKEN_TYPE', default: 'Bearer' },
      ],
    },
  ],
}));

const PLACEHOLDERS = {
  ATLASSIAN_API_URL: 'https://example.com/',
  ATLASSIAN_USERNAME: 'USERNAME',
  ATLASSIAN_PASSWORD: 'PASSWORD',
};

describe('getAtlassianAuthMethod', () => {
  it('treats placeholder defaults as not configured', () => {
    expect(getAtlassianAuthMethod(PLACEHOLDERS)).toBeNull();
  });

  it('prefers OAuth 2.0, as the backend does', () => {
    expect(
      getAtlassianAuthMethod({
        ATLASSIAN_OAUTH2_CLIENT_ID: 'client-id',
        ATLASSIAN_OAUTH2_CLIENT_SECRET: 'client-secret',
        ATLASSIAN_TOKEN: 'api-token',
      }),
    ).toBe('oauth2_client_credentials');
    expect(
      getAtlassianAuthMethod({
        ATLASSIAN_OAUTH2_CLIENT_ID: 'client-id',
        ATLASSIAN_OAUTH2_ACCESS_TOKEN: 'access-token',
      }),
    ).toBe('oauth2_access_token');
  });

  it('detects the other methods', () => {
    expect(
      getAtlassianAuthMethod({ ATLASSIAN_PERSONAL_ACCESS_TOKEN: 'pat' }),
    ).toBe('personal_access_token');
    expect(getAtlassianAuthMethod({ ATLASSIAN_TOKEN: 'api-token' })).toBe(
      'api_token',
    );
    expect(getAtlassianAuthMethod({ ATLASSIAN_PASSWORD: 'secret' })).toBe(
      'basic',
    );
  });
});

describe('prepareAtlassianSettings', () => {
  it('shows placeholders as empty and defaults to a service account', () => {
    const values = prepareAtlassianSettings(PLACEHOLDERS);

    expect(values).toMatchObject({
      ATLASSIAN_API_URL: '',
      ATLASSIAN_USERNAME: '',
      ATLASSIAN_PASSWORD: '',
      [AUTH_METHOD_FIELD]: 'oauth2_client_credentials',
    });
  });

  it('selects the configured method', () => {
    const values = prepareAtlassianSettings({
      ...PLACEHOLDERS,
      ATLASSIAN_TOKEN: 'api-token',
    });

    expect(values[AUTH_METHOD_FIELD]).toBe('api_token');
  });
});

describe('prepareAtlassianSubmission', () => {
  it('clears the secrets of every other method', () => {
    const settings = {
      ATLASSIAN_EMAIL: 'bot@example.com',
      ATLASSIAN_TOKEN: 'api-token',
      ATLASSIAN_PERSONAL_ACCESS_TOKEN: 'pat',
      ATLASSIAN_USERNAME: 'bot',
      ATLASSIAN_PASSWORD: 'secret',
      ATLASSIAN_OAUTH2_CLIENT_ID: 'client-id',
      ATLASSIAN_OAUTH2_CLIENT_SECRET: 'client-secret',
      ATLASSIAN_OAUTH2_ACCESS_TOKEN: 'access-token',
      ATLASSIAN_OAUTH2_TOKEN_TYPE: 'Bearer',
    };

    expect(
      prepareAtlassianSubmission(
        settings,
        'oauth2_client_credentials',
        settings,
      ),
    ).toEqual({
      ATLASSIAN_EMAIL: 'bot@example.com',
      ATLASSIAN_TOKEN: '',
      ATLASSIAN_PERSONAL_ACCESS_TOKEN: '',
      ATLASSIAN_USERNAME: '',
      ATLASSIAN_PASSWORD: '',
      ATLASSIAN_OAUTH2_CLIENT_ID: 'client-id',
      ATLASSIAN_OAUTH2_CLIENT_SECRET: 'client-secret',
      ATLASSIAN_OAUTH2_ACCESS_TOKEN: '',
      ATLASSIAN_OAUTH2_TOKEN_TYPE: 'Bearer',
    });
  });

  it('leaves untouched placeholders as they are', () => {
    const body = {
      ATLASSIAN_API_URL: '',
      ATLASSIAN_USERNAME: '',
      ATLASSIAN_PASSWORD: '',
      ATLASSIAN_TOKEN: 'api-token',
    };

    expect(prepareAtlassianSubmission(body, 'api_token', PLACEHOLDERS)).toEqual(
      { ATLASSIAN_TOKEN: 'api-token' },
    );
  });
});

describe('getAtlassianSiteName', () => {
  it('names the API gateway and plain hosts', () => {
    expect(
      getAtlassianSiteName('https://api.atlassian.com/ex/jira/cloud-1'),
    ).toBe('Atlassian Cloud (API gateway)');
    expect(getAtlassianSiteName('https://jira.example.com/')).toBe(
      'jira.example.com',
    );
  });
});
