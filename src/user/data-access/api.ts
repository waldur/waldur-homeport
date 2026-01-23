import { client } from 'waldur-js-client/client.gen';

import { fetchResultCount, parseNextPage } from '@waldur/core/api';
import { queryClient } from '@waldur/core/queryClient';
import { TableRequest } from '@waldur/table/types';

import { DataAccessHistoryEntry, DataAccessVisibility } from './types';

const API_BASE = '/api/users';

// Fetch data access visibility (who CAN access)
export const fetchDataAccessVisibility = async (
  userUuid: string,
): Promise<DataAccessVisibility> => {
  const response = await client.get({
    url: `${API_BASE}/${userUuid}/data_access/`,
    security: [{ in: 'header', type: 'http' }],
  });
  return response.data as DataAccessVisibility;
};

// Table fetcher for data access history (who DID access)
export const dataAccessHistoryFetcher =
  (userUuid: string) => (request: TableRequest) => {
    const query = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
    };
    return queryClient.fetchQuery({
      queryKey: ['table', request.tableKey, userUuid, query],
      queryFn: async () => {
        const response = await client.get({
          url: `${API_BASE}/${userUuid}/data_access_history/`,
          query,
          security: [{ in: 'header', type: 'http' }],
        });
        const rows = response.data as DataAccessHistoryEntry[];
        const resultCount = fetchResultCount(response);
        const nextPage = parseNextPage(response);
        return { rows, resultCount, nextPage };
      },
      staleTime: request.options?.staleTime,
    });
  };
