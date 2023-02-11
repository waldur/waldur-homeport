import { UISref, useCurrentStateAndParams } from '@uirouter/react';
import { FC, Fragment } from 'react';
import { QueryFunction, useInfiniteQuery } from 'react-query';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';

import { ResourceLink } from './ResourceLink';
import { DataPage } from './types';

interface ResourcesListProps {
  loadData: QueryFunction<DataPage>;
  queryKey: string;
  actions?: React.ReactNode;
}

export const ResourcesList: FC<ResourcesListProps> = ({
  loadData,
  queryKey,
  actions,
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

  const { state } = useCurrentStateAndParams();

  return status === 'loading' ? (
    <p>{translate('Loading')}</p>
  ) : status === 'error' ? (
    <p>{translate('Error')}</p>
  ) : (
    <div>
      <div className="d-flex justify-content-end mb-3">
        {actions}
        <UISref to={state.name} params={{ tab: queryKey }}>
          <a className="ms-3 btn btn-light">{translate('Detailed view')}</a>
        </UISref>
      </div>
      {data.pages.length === 1 && data.pages[0].data.length === 0 ? (
        <p className="text-center mt-8">{translate('List is empty.')}</p>
      ) : (
        <table className="table">
          <tbody>
            {data.pages.map((page, i) => (
              <Fragment key={i}>
                {page.data.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <h5>
                        {row.marketplace_resource_uuid ? (
                          <ResourceLink row={row}>{row.name}</ResourceLink>
                        ) : (
                          row.name
                        )}
                      </h5>
                      <p>{row.summary}</p>
                    </td>
                    <td>{row.state && <StateIndicator {...row.state} />}</td>
                    {row.url && (
                      <td className="row-actions">
                        <ActionButtonResource url={row.url} />
                      </td>
                    )}
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr>
              <td className="text-center" colSpan={5}>
                {hasNextPage && (
                  <div>
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="btn btn-link"
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
          </tbody>
        </table>
      )}
    </div>
  );
};
