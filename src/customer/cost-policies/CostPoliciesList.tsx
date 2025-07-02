import { FC } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { MarketplaceProjectEstimatedCostPoliciesListData } from 'waldur-js-client';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { CostPolicyActions } from './CostPolicyActions';
import { CostPolicyCreateButton } from './CostPolicyCreateButton';
import { getCostPolicyActionOptions, policyPeriodOptions } from './utils';

const filtersSelector = createSelector(getCustomer, (customer) => {
  const result: MarketplaceProjectEstimatedCostPoliciesListData['query'] = {};
  if (customer) {
    result.customer_uuid = customer.uuid;
  }
  return result;
});

interface CostPoliciesListTableProps extends Partial<TableProps> {
  table: string;
  hideColumns?: ('project' | 'price_estimate')[];
}

export const CostPoliciesListTable: FC<CostPoliciesListTableProps> = ({
  table,
  filter,
  hideColumns = [],
  ...props
}) => {
  const tableProps = useTable({
    table,
    filter: filter,
    fetchData: createFetcher('marketplace-project-estimated-cost-policies'),
    queryField: 'query',
  });

  return (
    <Table
      {...tableProps}
      columns={[
        !hideColumns.includes('project') && {
          title: translate('Project'),
          render: ({ row }) => (
            <ProjectLink
              row={{
                is_industry: row.is_industry,
                name: row.scope_name,
                uuid: row.scope_uuid,
              }}
            />
          ),
        },
        {
          title: translate('Action'),
          render: ({ row }) => (
            <>
              {
                getCostPolicyActionOptions().find(
                  (option) => option.value === row.actions,
                )?.label
              }
            </>
          ),
        },
        {
          title: translate('Has fired'),
          render: ({ row }) => <BooleanBadge value={row.has_fired} />,
        },
        {
          title: translate('Organization credit'),
          render: ({ row }) =>
            row.customer_credit ? defaultCurrency(row.customer_credit) : 'N/A',
        },
        {
          title: translate('Project credit'),
          render: ({ row }) =>
            row.project_credit ? defaultCurrency(row.project_credit) : 'N/A',
        },
        {
          title: translate('Period'),
          render: ({ row }) => (
            <>
              {Object.values(policyPeriodOptions).find(
                (option) => option.value === row.period,
              )?.label || row.period_name}
            </>
          ),
        },
        {
          title: translate('Cost threshold'),
          render: ({ row }) => <>{defaultCurrency(row.limit_cost)}</>,
        },
        !hideColumns.includes('price_estimate') && {
          title: translate('Project estimated cost'),
          render: ({ row }) => (
            <>
              {defaultCurrency(
                (row.billing_price_estimate &&
                  row.billing_price_estimate.current) ||
                  0,
              )}
            </>
          ),
        },
      ].filter(Boolean)}
      verboseName={translate('Cost policies')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      rowActions={({ row }) => (
        <CostPolicyActions
          row={row}
          type="project"
          refetch={tableProps.fetch}
        />
      )}
      hasQuery={true}
      showPageSizeSelector={true}
      tableActions={
        <CostPolicyCreateButton type="project" refetch={tableProps.fetch} />
      }
      {...props}
    />
  );
};

export const CostPoliciesList = () => {
  const filter = useSelector(filtersSelector);

  return <CostPoliciesListTable table="CostPoliciesList" filter={filter} />;
};
