import { client } from 'waldur-js-client/client.gen';

import { fetchResultCount, parseNextPage } from '@waldur/core/api';
import { queryClient } from '@waldur/core/queryClient';
import { TableRequest } from '@waldur/table/types';

export interface RequestTypeAdmin {
  uuid: string;
  url: string;
  name: string;
  issue_type_name: string;
  backend_id: number | null;
  backend_name: string | null;
  is_active: boolean;
  order: number;
  is_synced: boolean;
}

const API_URL = '/api/support-request-types-admin/';

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
      const response = await client.get({
        url: API_URL,
        query,
        security: [{ in: 'header', type: 'http' }],
      });
      const rows = response.data as RequestTypeAdmin[];
      const resultCount = fetchResultCount(response);
      const nextPage = parseNextPage(response);
      return { rows, resultCount, nextPage };
    },
    staleTime: request.options?.staleTime,
  });
};

// Create a request type
export const createRequestType = async (
  data: Partial<RequestTypeAdmin>,
): Promise<RequestTypeAdmin> => {
  const response = await client.post({
    url: API_URL,
    body: data,
    security: [{ in: 'header', type: 'http' }],
  });
  return response.data as RequestTypeAdmin;
};

// Update a request type
export const updateRequestType = async (
  uuid: string,
  data: Partial<RequestTypeAdmin>,
): Promise<RequestTypeAdmin> => {
  const response = await client.patch({
    url: `${API_URL}${uuid}/`,
    body: data,
    security: [{ in: 'header', type: 'http' }],
  });
  return response.data as RequestTypeAdmin;
};

// Delete a request type
export const deleteRequestType = async (uuid: string): Promise<void> => {
  await client.delete({
    url: `${API_URL}${uuid}/`,
    security: [{ in: 'header', type: 'http' }],
  });
};

// Activate a request type
export const activateRequestType = async (uuid: string): Promise<void> => {
  await client.post({
    url: `${API_URL}${uuid}/activate/`,
    security: [{ in: 'header', type: 'http' }],
  });
};

// Deactivate a request type
export const deactivateRequestType = async (uuid: string): Promise<void> => {
  await client.post({
    url: `${API_URL}${uuid}/deactivate/`,
    security: [{ in: 'header', type: 'http' }],
  });
};
