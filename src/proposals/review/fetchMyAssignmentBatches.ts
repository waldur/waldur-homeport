import { myAssignmentBatchesList } from 'waldur-js-client';

import { createClientPaginatedFetcher } from '@/table/api';
import { TableRequest } from '@/table/types';

/**
 * The endpoint returns the reviewer's whole list without paging or a result
 * count, so paging and the call name search happen here. The status filter is
 * the server's: it applies the effective status, which counts a batch past its
 * deadline as expired before the expiry task has stored it.
 */
export const fetchMyAssignmentBatches = (request: TableRequest) =>
  myAssignmentBatchesList({
    query: request.filter?.status
      ? { status: request.filter.status }
      : undefined,
  }).then(({ data }) =>
    createClientPaginatedFetcher(data ?? [], { queryField: 'call_name' })(
      request,
    ),
  );
