import {
  describeConfigError,
  fetchRuntimeConfig,
  getApiUrlFromMeta,
} from 'waldur-runtime-config';

import { afterBootstrap } from '@/afterBootstrap';
import { ENV } from '@/core/config';

import { initApiClient } from './api';
import { setupAuthCore } from './authCoreSetup';

/**
 * Fetches the backend's public configuration (branding, feature flags,
 * language choices, plugin settings) and populates ENV. Pure data loading,
 * no DOM/analytics/router side effects — kept separate from afterBootstrap's
 * composition so the two concerns can be reasoned about independently.
 */
async function loadPublicConfig() {
  setupAuthCore();
  const restApi = getApiUrlFromMeta();
  if (restApi === '__API_URL__') {
    throw new Error('API URL is not configured');
  }
  ENV.apiEndpoint = restApi;
  initApiClient();
  try {
    const config = await fetchRuntimeConfig();
    Object.assign(ENV, config);
  } catch (error) {
    throw describeConfigError(error, ENV.apiEndpoint);
  }
}

export async function loadConfig() {
  await loadPublicConfig();
  afterBootstrap();
  return true;
}
