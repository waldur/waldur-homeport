import {
  supportRequestTypesAdminList,
  RequestTypeAdmin,
} from 'waldur-js-client';

export type { RequestTypeAdmin };

import { fetchResultCount, parseNextPage } from '@waldur/core/api';
import { queryClient } from '@waldur/core/queryClient';
import { TableRequest } from '@waldur/table/types';

// Fetcher function for table component
export const requestTypesAdminFetcher = (request: TableRequest) => {
  const query = {
    page: request.currentPage,
    page_size: request.pageSize,
    ...request.filter,
  };
  return queryClient.fetchQuery({
    queryKey: ['table', request.tableKey, query],
    queryFn: async () => {
      const response = await supportRequestTypesAdminList({
        query,
      });
      const rows = response.data as RequestTypeAdmin[];
      const resultCount = fetchResultCount(response);
      const nextPage = parseNextPage(response);
      return { rows, resultCount, nextPage };
    },
    staleTime: request.options?.staleTime,
  });
};
