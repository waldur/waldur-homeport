import type { AuthMethodEnum } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Choice } from '@/marketplace/offerings/types';
import { SettingsDescription } from '@/SettingsDescription';

/** Auth methods the setup wizard offers, plus a manually pasted OAuth 2.0 token. */
export type AtlassianAuthMethod = AuthMethodEnum | 'oauth2_access_token';

/** Form-only field holding the auth method chosen in the advanced settings. */
export const AUTH_METHOD_FIELD = '_atlassianAuthMethod';

/** Settings holding each auth method's credentials. */
export const ATLASSIAN_CREDENTIAL_FIELDS: Record<
  AtlassianAuthMethod,
  string[]
> = {
  oauth2_client_credentials: [
    'ATLASSIAN_OAUTH2_CLIENT_ID',
    'ATLASSIAN_OAUTH2_CLIENT_SECRET',
  ],
  oauth2_access_token: [
    'ATLASSIAN_OAUTH2_CLIENT_ID',
    'ATLASSIAN_OAUTH2_ACCESS_TOKEN',
    'ATLASSIAN_OAUTH2_TOKEN_TYPE',
  ],
  api_token: ['ATLASSIAN_EMAIL', 'ATLASSIAN_TOKEN'],
  personal_access_token: ['ATLASSIAN_PERSONAL_ACCESS_TOKEN'],
  basic: ['ATLASSIAN_USERNAME', 'ATLASSIAN_PASSWORD'],
};

// Not secret, and needed by no other method: kept when switching methods. The
// settings API does not accept a blank email address.
const KEPT_WHEN_SWITCHING = ['ATLASSIAN_EMAIL', 'ATLASSIAN_OAUTH2_TOKEN_TYPE'];

// Their defaults are placeholders (https://example.com/, USERNAME, PASSWORD).
const PLACEHOLDER_SETTINGS = [
  'ATLASSIAN_API_URL',
  'ATLASSIAN_USERNAME',
  'ATLASSIAN_PASSWORD',
];

export const getAtlassianAuthMethodChoices = (): Choice[] => [
  {
    value: 'oauth2_client_credentials',
    label: translate('Service account (OAuth 2.0)'),
    description: translate(
      'Recommended for Atlassian Cloud. Uses the client ID and secret of a service account OAuth 2.0 credential; Waldur renews the access tokens itself.',
    ),
  },
  {
    value: 'api_token',
    label: translate('API token (Atlassian Cloud)'),
    description: translate(
      'Email address and API token of an Atlassian account.',
    ),
  },
  {
    value: 'personal_access_token',
    label: translate('Personal access token (Data Center)'),
    description: translate('For Jira Server and Data Center.'),
  },
  {
    value: 'basic',
    label: translate('Username and password'),
    description: translate('Legacy. Not accepted by Atlassian Cloud.'),
  },
];

export const getAtlassianAuthMethodLabel = (
  method: AtlassianAuthMethod | null,
): string => {
  if (method === 'oauth2_access_token') {
    return translate('OAuth 2.0 access token');
  }
  return (
    getAtlassianAuthMethodChoices().find((choice) => choice.value === method)
      ?.label ?? translate('Not configured')
  );
};

const getAtlassianSettingItems = () =>
  SettingsDescription.find((group) =>
    group.description.toLowerCase().includes('atlassian'),
  )?.items || [];

/** A setting's value, or '' while it still holds its default. */
export const getConfiguredValue = (
  settings: Record<string, unknown>,
  key: string,
) => {
  const value = settings?.[key];
  const item = getAtlassianSettingItems().find((field) => field.key === key);
  return value && value !== item?.default ? value : '';
};

/** The configured auth method, in the backend's order of preference. */
export const getAtlassianAuthMethod = (
  settings: Record<string, unknown>,
): AtlassianAuthMethod | null => {
  const has = (key: string) => Boolean(getConfiguredValue(settings, key));
  if (has('ATLASSIAN_OAUTH2_CLIENT_ID')) {
    if (has('ATLASSIAN_OAUTH2_CLIENT_SECRET')) {
      return 'oauth2_client_credentials';
    }
    if (has('ATLASSIAN_OAUTH2_ACCESS_TOKEN')) {
      return 'oauth2_access_token';
    }
  }
  if (has('ATLASSIAN_PERSONAL_ACCESS_TOKEN')) {
    return 'personal_access_token';
  }
  if (has('ATLASSIAN_TOKEN')) {
    return 'api_token';
  }
  if (has('ATLASSIAN_PASSWORD')) {
    return 'basic';
  }
  return null;
};

/** Initial values for the advanced settings form: placeholders shown as empty. */
export const prepareAtlassianSettings = (
  settings: Record<string, unknown>,
): Record<string, unknown> => {
  const values = { ...settings };
  PLACEHOLDER_SETTINGS.forEach((key) => {
    if (key in values) {
      values[key] = getConfiguredValue(settings, key);
    }
  });
  values[AUTH_METHOD_FIELD] =
    getAtlassianAuthMethod(settings) ?? 'oauth2_client_credentials';
  return values;
};

/**
 * Settings to submit from the advanced settings form.
 *
 * The credentials of every method but the chosen one are cleared: the backend
 * uses the first method it finds configured, so leftovers would override the
 * choice. A placeholder left empty is not submitted, so it stays as it was.
 */
export const prepareAtlassianSubmission = (
  body: Record<string, unknown>,
  method: AtlassianAuthMethod,
  original: Record<string, unknown>,
): Record<string, unknown> => {
  const result = { ...body };
  const kept = ATLASSIAN_CREDENTIAL_FIELDS[method] || [];
  Object.values(ATLASSIAN_CREDENTIAL_FIELDS)
    .flat()
    .forEach((key) => {
      if (
        key in result &&
        !kept.includes(key) &&
        !KEPT_WHEN_SWITCHING.includes(key)
      ) {
        result[key] = '';
      }
    });
  PLACEHOLDER_SETTINGS.forEach((key) => {
    if (result[key] === '' && !getConfiguredValue(original, key)) {
      delete result[key];
    }
  });
  return result;
};

/** A readable name for the Jira an API URL points at. */
export const getAtlassianSiteName = (apiUrl: string): string => {
  try {
    const host = new URL(apiUrl).host;
    return host === 'api.atlassian.com'
      ? translate('Atlassian Cloud (API gateway)')
      : host;
  } catch {
    return apiUrl;
  }
};
