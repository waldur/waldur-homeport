import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { ComponentType, Fragment, ReactNode } from 'react';

import { translate } from '@/i18n';
import { DataPage } from '@/table/api';

export const InfiniteList = <RowType,>({
  context,
  RowComponent,
  emptyMessage,
}: {
  context: UseInfiniteQueryResult<InfiniteData<DataPage<RowType>>>;
  RowComponent: ComponentType<{ row: RowType }>;
  emptyMessage: ReactNode;
}) =>
  context.status === 'pending' ? (
    <p className="text-center text-dark mb-0">{translate('Loading')}</p>
  ) : context.status === 'error' ? (
    <p className="text-center text-dark mb-0">{translate('Error')}</p>
  ) : context.data.pages[0].rows.length === 0 ? (
    typeof emptyMessage === 'string' ? (
      <p className="text-center text-dark mb-0">{emptyMessage}</p>
    ) : (
      emptyMessage
    )
  ) : (
    <>
      <div className="timeline">
        {context.data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.rows.map((row, index) => (
              <RowComponent row={row} key={index} />
            ))}
          </Fragment>
        ))}
      </div>
      <div className="text-center">
        {context.hasNextPage && (
          <div>
            <button
              onClick={() => context.fetchNextPage()}
              disabled={context.isFetchingNextPage}
              className="btn btn-link"
            >
              {context.isFetchingNextPage
                ? translate('Loading more...')
                : translate('Load more')}
            </button>
          </div>
        )}
        <div>
          {context.isFetching && !context.isFetchingNextPage
            ? translate('Fetching...')
            : null}
        </div>
      </div>
    </>
  );
