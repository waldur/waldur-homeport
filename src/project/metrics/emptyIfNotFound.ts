import { getErrorStatus } from '@/error/utils';

/**
 * For a metrics query's catch: a project or resource the user may not see
 * answers 404, as a missing one does, and then reads as reporting nothing.
 * Left to fail, the query would send the whole page to "Not found".
 */
export const emptyIfNotFound =
  <T>(empty: T) =>
  (error: unknown): T => {
    if (getErrorStatus(error) === 404) {
      return empty;
    }
    throw error;
  };
