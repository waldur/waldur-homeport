/**
 * The app's retry rule for queries, with a configurable limit: a 4xx
 * (403/404/400/...) is deterministic, so retrying it only repeats the failure
 * and any error toast or redirect; transient and server errors are retried up
 * to `limit` times.
 */
export const retryServerErrors =
  (limit = 3) =>
  (failureCount: number, error: any) => {
    const status = error?.response?.status ?? error?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return false;
    }
    return failureCount < limit;
  };

/**
 * Query meta for a query that renders its own error state: the global error
 * handler then leaves the page alone instead of redirecting to an error page.
 */
export const OWN_ERROR_STATE = { skipGlobalErrorRedirect: true } as const;
