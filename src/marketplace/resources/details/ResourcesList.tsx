import { FC, Fragment } from 'react';
import { QueryFunction, useInfiniteQuery } from 'react-query';

import { translate } from '@waldur/i18n';

import { ResourceLink } from './ResourceLink';
import { ResourceStateIndicator } from './ResourceStateIndicator';
import { DataPage } from './types';

interface ResourcesListProps {
  loadData: QueryFunction<DataPage>;
  queryKey: string;
}

export const ResourcesList: FC<ResourcesListProps> = ({
  loadData,
  queryKey,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<any, any, DataPage>(queryKey, loadData, {
    getNextPageParam: (lastPage: DataPage) => lastPage.nextPage,
  });

  return status === 'loading' ? (
    <p>{translate('Loading')}</p>
  ) : status === 'error' ? (
    <p>{translate('Error')}</p>
  ) : (
    <>
      {data.pages.map((page, i) => (
        <Fragment key={i}>
          {page.data.map((row, index) => (
            <p key={index} className="d-flex">
              <div className="flex-grow-1">
                <h5>
                  {row.marketplace_resource_uuid ? (
                    <ResourceLink row={row}>{row.name}</ResourceLink>
                  ) : (
                    row.name
                  )}
                </h5>
                <p>{row.summary}</p>
              </div>
              <div>
                {row.state && <ResourceStateIndicator state={row.state} />}
              </div>
            </p>
          ))}
        </Fragment>
      ))}
      <tr>
        <td></td>
        <td className="text-center" colSpan={5}>
          {hasNextPage && (
            <div>
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn btn-default"
              >
                {isFetchingNextPage
                  ? translate('Loading more...')
                  : translate('Load more')}
              </button>
            </div>
          )}
          <div>
            {isFetching && !isFetchingNextPage
              ? translate('Fetching...')
              : null}
          </div>
        </td>
      </tr>
    </>
  );
};
