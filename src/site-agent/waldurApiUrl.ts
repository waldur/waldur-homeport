import { ENV } from '@/core/config';

/**
 * An absolute URL under Waldur's API, as a site agent configuration or a
 * script needs it: absolute even where the API is served from the page's own
 * origin (an `apiEndpoint` of '/').
 */
export const waldurApiUrl = (
  path = '',
  apiEndpoint = ENV.apiEndpoint,
  origin = window.location.origin,
) =>
  new URL(
    `api/${path}`,
    new URL(apiEndpoint.replace(/\/*$/, '/'), origin),
  ).toString();
