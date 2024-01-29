import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash';
import { FC, Fragment } from 'react';

import { fixURL } from '@waldur/core/api';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { CostPolicy } from '@waldur/customer/cost-policies/types';
import { getCostPolicyActionOptions } from '@waldur/customer/cost-policies/utils';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';
import { Project } from '@waldur/workspace/types';

interface DataPage {
  data: CostPolicy[];
  nextPage?: number;
}

interface ProjectDashboardCostPoliciesProps {
  project: Project;
  setCostPolicies: React.Dispatch<React.SetStateAction<CostPolicy[]>>;
  pageSize?: number;
}

export const ProjectDashboardCostPolicies: FC<ProjectDashboardCostPoliciesProps> =
  ({ project, pageSize, setCostPolicies }) => {
    const loadData: QueryFunction<DataPage> = async (context) => {
      const response = await parseResponse(
        fixURL('/marketplace-project-estimated-cost-policies/'),
        {
          project_uuid: project.uuid,
          page: context.pageParam,
          page_size: pageSize,
        },
        { signal: context.signal },
      );
      setCostPolicies((prev) => uniqBy(prev.concat(response.rows), 'uuid'));
      return {
        data: response.rows,
        nextPage: response.nextPage,
      };
    };
    return (
      <InfiniteListTable
        loadData={loadData}
        queryKey="costPolicies"
        pageSize={pageSize}
      />
    );
  };

interface InfiniteListTableProps {
  loadData: QueryFunction<DataPage>;
  queryKey: string;
  pageSize: number;
}

const InfiniteListTable: FC<InfiniteListTableProps> = ({
  loadData,
  queryKey,
  pageSize,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<any, any, DataPage>([queryKey], loadData, {
    getNextPageParam: (lastPage: DataPage) => lastPage.nextPage,
  });

  return status === 'loading' ? (
    <p>{translate('Loading')}</p>
  ) : status === 'error' ? (
    <p>{translate('Error')}</p>
  ) : (
    <>
      <div className="mh-125px overflow-auto">
        {data.pages.length > 0 && data.pages[0].data.length > 0 && (
          <table className="table table-sm">
            <thead className="position-sticky top-0 bg-body z-index-1">
              <tr>
                <th>{translate('Policy')}</th>
                <th>{translate('Threshold')}</th>
                <th>{translate('Action')}</th>
                <th className="w-100px">{translate('Has fired')}</th>
              </tr>
            </thead>
            <tbody>
              {data.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.data.map((row, index) => (
                    <tr key={index}>
                      <td>
                        {translate('Policy')}
                        {' #' + (pageSize * i + index + 1)}
                      </td>
                      <td>{defaultCurrency(row.limit_cost)}</td>
                      <td>
                        {
                          getCostPolicyActionOptions().find(
                            (option) => option.value === row.actions,
                          )?.label
                        }
                      </td>
                      <td>
                        {row.has_fired ? translate('Yes') : translate('No')}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="text-center">
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
          {isFetching && !isFetchingNextPage ? translate('Fetching...') : null}
        </div>
      </div>
    </>
  );
};

ProjectDashboardCostPolicies.defaultProps = {
  pageSize: 3,
};
