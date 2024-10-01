import { InfiniteQueryObserverResult } from '@tanstack/react-query';
import { Fragment, ReactNode } from 'react';

import { translate } from '@waldur/i18n';

export const InfiniteList = ({
  context,
  RowComponent,
  emptyMessage,
}: {
  context: InfiniteQueryObserverResult<{ data: any[] }>;
  RowComponent;
  emptyMessage: ReactNode;
}) =>
  context.status === 'loading' ? (
    <p className="text-center text-dark mb-0">{translate('Loading')}</p>
  ) : context.status === 'error' ? (
    <p className="text-center text-dark mb-0">{translate('Error')}</p>
  ) : context.data.pages[0].data.length === 0 ? (
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
            {page.data.map((row, index) => (
              <RowComponent row={row} key={index} />
            ))}
          </Fragment>
        ))}
      </div>
      <p className="text-center">
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
      </p>
    </>
  );
