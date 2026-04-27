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

export async function loadConfig() {
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
    if (error instanceof TypeError) {
      throw new Error(
        `Unable to fetch server configuration. Please check if you can connect to ${ENV.apiEndpoint} from your browser and contact support if the error continues.`,
      );
    } else if (error instanceof SyntaxError) {
      throw new Error(
        `Unable to fetch server configuration. Server does not return valid JSON.`,
      );
    } else if (error.response?.status >= 400) {
      throw new Error(
        `Unable to fetch server configuration. Error message: ${error.statusText}`,
      );
    } else {
      throw new Error(error);
    }
  }
  afterBootstrap();
  return true;
}
