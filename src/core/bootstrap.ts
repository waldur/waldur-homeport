import { queryOptions } from '@tanstack/react-query';

import {
  describeConfigError,
  fetchRuntimeConfig,
  getApiUrlFromMeta,
} from 'waldur-runtime-config';

import { afterBootstrap } from '@/afterBootstrap';
import { ENV } from '@/core/config';
import { BOOTSTRAP_QUERY_KEY } from '@/core/queryClient';

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

/**
 * The root suspense query that loads the configuration and runs the one-time
 * setup. It runs once per page load: refetching it, on window focus or
 * reconnect as React Query does by default, would re-fetch the configuration
 * and redo every setup step.
 */
export const bootstrapQueryOptions = queryOptions({
  queryKey: BOOTSTRAP_QUERY_KEY,
  queryFn: loadConfig,
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});
