import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';

import { fixURL } from '@waldur/core/api';
import { Event } from '@waldur/events/types';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { EventRow } from './EventRow';
import { InfiniteList } from './InfiniteList';

interface DataPage {
  data: Event[];
  nextPage?: number;
}

export const ResourceTimeline = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/events/'),
      {
        scope: resource.url,
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
    ['resource-events'],
    loadData,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    },
  );

  return (
    <InfiniteList
      RowComponent={EventRow}
      context={context}
      emptyMessage={translate('There are no resource events.')}
    />
  );
};
