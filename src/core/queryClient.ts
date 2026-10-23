import { QueryCache, QueryClient } from '@tanstack/react-query';

import { retryServerErrors } from '@/core/queryRetry';
import { getErrorStatus, goToErrorPage } from '@/error/utils';

/** Key of the root suspense query that bootstraps the app (Application.tsx). */
export const BOOTSTRAP_QUERY_KEY = ['Application'];

const QUERY_REDIRECT_STATUSES = [404, 428];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx is deterministic: only transient and server errors are retried.
      retry: retryServerErrors(),
    },
  },
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      // Queries that render their own error state (e.g. a non-essential preview
      // fetch inside a modal) opt out of the global redirect via
      // `meta: { skipGlobalErrorRedirect: true }`, so a 404/500 there doesn't
      // navigate the whole app to an error page.
      if (query?.meta?.skipGlobalErrorRedirect) {
        return;
      }
      // Don't redirect for "Invalid page" errors - tables handle this by resetting pagination
      // SDK throws error body directly: { detail: "Invalid page." }
      // Axios-style errors have: error.response.data.detail
      const detail = error?.detail || error?.response?.data?.detail;
      if (detail === 'Invalid page.') {
        return;
      }
      // Only a missing resource (404) and an incomplete profile (428) leave
      // the page. Any other failure is left to the component that asked:
      // tables and most queries render their own error state with a retry,
      // and redirecting the whole page because one section failed would hide
      // everything else on it.
      if (QUERY_REDIRECT_STATUSES.includes(getErrorStatus(error))) {
        goToErrorPage(error);
      }
    },
  }),
});
