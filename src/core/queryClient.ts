import { QueryCache, QueryClient } from '@tanstack/react-query';

import { retryServerErrors } from '@/core/queryRetry';
import { goToNotFound } from '@/error/utils';
import { router } from '@/router';

/** Key of the root suspense query that bootstraps the app (Application.tsx). */
export const BOOTSTRAP_QUERY_KEY = ['Application'];

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
      if (error?.response?.status === 403) {
        router.stateService.target('errorPage.noPermission');
      } else if (error?.response?.status === 428) {
        // HTTP 428 Precondition Required - user profile incomplete with enforcement enabled
        router.stateService.go('profile-manage');
      } else if (error?.response?.status === 500) {
        router.stateService.target('errorPage.severError');
      } else if (error?.response?.status === 503) {
        router.stateService.target('errorPage.serviceNotAvailable');
      } else if (error?.response?.status == 404) {
        goToNotFound();
      }
    },
  }),
});
