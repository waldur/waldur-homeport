import { client } from 'waldur-js-client/client.gen';

import { fetchResultCount, parseNextPage } from '@waldur/core/api';
import { queryClient } from '@waldur/core/queryClient';
import { TableRequest } from '@waldur/table/types';

export interface IssueStatusAdmin {
  uuid: string;
  url: string;
  name: string;
  type: number;
  type_display: string;
}

// Type constants matching backend
export const IssueStatusTypes = {
  RESOLVED: 0,
  CANCELED: 1,
} as const;

export const IssueStatusTypeChoices = [
  { value: IssueStatusTypes.RESOLVED, label: 'Resolved' },
  { value: IssueStatusTypes.CANCELED, label: 'Canceled' },
];

const API_URL = '/api/support-issue-statuses/';

// Fetcher function for table component
export const issueStatusesFetcher = (request: TableRequest) => {
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
      const rows = response.data as IssueStatusAdmin[];
      const resultCount = fetchResultCount(response);
      const nextPage = parseNextPage(response);
      return { rows, resultCount, nextPage };
    },
    staleTime: request.options?.staleTime,
  });
};

// Create an issue status
export const createIssueStatus = async (
  data: Partial<IssueStatusAdmin>,
): Promise<IssueStatusAdmin> => {
  const response = await client.post({
    url: API_URL,
    body: data,
    security: [{ in: 'header', type: 'http' }],
  });
  return response.data as IssueStatusAdmin;
};

// Update an issue status
export const updateIssueStatus = async (
  uuid: string,
  data: Partial<IssueStatusAdmin>,
): Promise<IssueStatusAdmin> => {
  const response = await client.patch({
    url: `${API_URL}${uuid}/`,
    body: data,
    security: [{ in: 'header', type: 'http' }],
  });
  return response.data as IssueStatusAdmin;
};

// Delete an issue status
export const deleteIssueStatus = async (uuid: string): Promise<void> => {
  await client.delete({
    url: `${API_URL}${uuid}/`,
    security: [{ in: 'header', type: 'http' }],
  });
};
