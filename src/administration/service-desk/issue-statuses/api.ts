import { IssueStatus, supportIssueStatusesList } from 'waldur-js-client';

export type IssueStatusAdmin = IssueStatus;

import { fetchResultCount, parseNextPage } from '@waldur/core/api';
import { queryClient } from '@waldur/core/queryClient';
import { TableRequest } from '@waldur/table/types';

// Type constants matching backend
export const IssueStatusTypes = {
  RESOLVED: 0,
  CANCELED: 1,
} as const;

export const IssueStatusTypeChoices = [
  { value: IssueStatusTypes.RESOLVED, label: 'Resolved' },
  { value: IssueStatusTypes.CANCELED, label: 'Canceled' },
];

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
      const response = await supportIssueStatusesList({
        query,
      });
      const rows = response.data as IssueStatusAdmin[];
      const resultCount = fetchResultCount(response);
      const nextPage = parseNextPage(response);
      return { rows, resultCount, nextPage };
    },
    staleTime: request.options?.staleTime,
  });
};
