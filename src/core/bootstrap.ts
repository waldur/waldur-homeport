import { configurationRetrieve } from 'waldur-js-client';

import { afterBootstrap } from '@/afterBootstrap';
import { ENV } from '@/core/config';

import { initApiClient } from './api';

const getApiUrl = () =>
  document.querySelector('meta[name="api-url"]').getAttribute('content');

const parseLanguages = (inputValue) => {
  const languageLabels = inputValue.reduce(
    (result, [code, label]) => ({
      ...result,
      [code]: label,
    }),
    {},
  );
  return inputValue
    .map((language) => language[0])
    .map((code) => ({
      code,
      label: languageLabels[code],
    }));
};

/**
 * Fetches the backend's public configuration (branding, feature flags,
 * language choices, plugin settings) and populates ENV. Pure data loading,
 * no DOM/analytics/router side effects — kept separate from afterBootstrap's
 * composition so the two concerns can be reasoned about independently.
 */
async function loadPublicConfig() {
  const restApi = getApiUrl();
  if (restApi === '__API_URL__') {
    throw new Error('API URL is not configured');
  }
  ENV.apiEndpoint = restApi;
  initApiClient();
  try {
    const { LANGUAGES, LANGUAGE_CODE, FEATURES, ...plugins } = (
      await configurationRetrieve({ auth: null, parseAs: 'json' })
    ).data as any;
    Object.assign(ENV, {
      plugins,
      languageChoices: parseLanguages(LANGUAGES),
      defaultLanguage: LANGUAGE_CODE,
      FEATURES,
    });
  } catch (error) {
    let message: string;
    if (error instanceof TypeError) {
      message = `Unable to fetch server configuration. Please check if you can connect to ${ENV.apiEndpoint} from your browser and contact support if the error continues.`;
    } else if (error instanceof SyntaxError) {
      message = `Unable to fetch server configuration. Server does not return valid JSON.`;
    } else if (error?.response?.status >= 400) {
      message = `Unable to fetch server configuration. Error message: ${error.statusText}`;
    } else {
      message = `Unable to fetch server configuration.`;
    }
    // Preserve the underlying error via `cause` so it remains visible in
    // devtools and Sentry alongside the user-facing message.
    const wrapped = new Error(message);
    (wrapped as Error & { cause?: unknown }).cause = error;
    throw wrapped;
  }
}

export async function loadConfig() {
  await loadPublicConfig();
  afterBootstrap();
  return true;
}
