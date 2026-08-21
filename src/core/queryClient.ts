import { QueryCache, QueryClient } from '@tanstack/react-query';

import { goToNotFound } from '@/error/utils';
import { router } from '@/router';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx (403/404/400/...) is deterministic — retrying it just repeats the
      // failure and any error toast/redirect (React Query defaults to 3
      // retries, which is what turned a single 403 on a preview query into a
      // toast storm). Only retry transient/server errors.
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 3;
      },
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
