import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { Issue } from '@waldur/issues/list/types';
import { parseResponse } from '@waldur/table/api';

import { InfiniteList } from './InfiniteList';
import { IssueRow } from './IssueRow';

interface DataPage {
  data: Issue[];
  nextPage?: number;
}

export const ResourceIssues = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/support-issues/'),
      {
        resource: resource.url,
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows,
      nextPage: response.nextPage,
    };
  };

  const context = useInfiniteQuery<any, any, DataPage>(
    ['resource-issues'],
    loadData,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    },
  );

  return (
    <InfiniteList
      RowComponent={IssueRow}
      context={context}
      emptyMessage={translate('There are no resource issues.')}
    />
  );
};
