import { ENV } from '@/core/config';

/**
 * The URL to fetch an uploaded file from.
 *
 * The API builds file links from the host it was reached at. Where the SPA
 * reaches the API through its own origin (a relative API endpoint, as the dev
 * and preview stacks configure it), that host is the proxy's upstream --
 * `http://localhost:<port>/api/media/...` -- which the browser cannot reach.
 * Such a link is fetched from the SPA's own origin instead. An API on an
 * absolute endpoint (production) is left as it is. A relative /api/ path is
 * made absolute on the same origin too.
 */
export const resolveFileUrl = (url: string): string => {
  if (!url || !ENV.apiEndpoint?.startsWith('/')) {
    return url;
  }
  try {
    const parsed = new URL(url, window.location.origin);
    // Also a relative /api/ path: the request helper would prefix the
    // relative endpoint to it again (//api/...), which is no URL at all.
    if (parsed.pathname.startsWith('/api/')) {
      return window.location.origin + parsed.pathname + parsed.search;
    }
  } catch {
    // Not a URL: leave it to the request to fail as before.
  }
  return url;
};
