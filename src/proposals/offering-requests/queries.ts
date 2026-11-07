import { InvalidateQueryFilters } from '@tanstack/react-query';

/**
 * What an answer to a request changes beyond its table: which providers the
 * sidebar lists, and the pending-request badges on them.
 */
export const OFFERING_REQUEST_ANSWERED_QUERIES: InvalidateQueryFilters[] = [
  { queryKey: ['provider-call-scopes'] },
  { queryKey: ['provider-pending-requests-count'] },
  { queryKey: ['my-tasks-count'] },
];
