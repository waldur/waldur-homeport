import { Fragment } from 'react';
import { QueryFunction, useInfiniteQuery } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { Event } from '@waldur/events/types';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { EventRow } from './EventRow';

interface DataPage {
  data: Event[];
  nextPage?: number;
}

const useResourceTimeline = (resource) => {
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

  return useInfiniteQuery<any, any, DataPage>('resource-events', loadData, {
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export const ResourceTimeline = ({ resource }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useResourceTimeline(resource);

  return status === 'loading' ? (
    <p className="text-center">{translate('Loading')}</p>
  ) : status === 'error' ? (
    <p className="text-center">{translate('Error')}</p>
  ) : data.pages[0].data.length === 0 ? (
    <p className="text-center">{translate('There are no resource events.')}</p>
  ) : (
    <>
      <div className="timeline">
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.data.map((event, index) => (
              <EventRow event={event} key={index} />
            ))}
          </Fragment>
        ))}
      </div>
      <p className="text-center">
        {hasNextPage && (
          <div>
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage
                ? translate('Loading more...')
                : translate('Load more')}
            </button>
          </div>
        )}
        <div>
          {isFetching && !isFetchingNextPage ? translate('Fetching...') : null}
        </div>
      </p>
    </>
  );
};
