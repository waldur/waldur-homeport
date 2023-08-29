import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { CostPolicyCreateButton } from './CostPolicyCreateButton';
import { CostPolicyDeleteButton } from './CostPolicyDeleteButton';
import { getCostPolicyActionOptions } from './utils';

const filtersSelector = createSelector(getCustomer, (customer) => {
  const result: Record<string, any> = {};
  if (customer) {
    result.customer_uuid = customer.uuid;
  }
  return result;
});

export const CostPoliciesList = () => {
  const filter = useSelector(filtersSelector);
  const tableProps = useTable({
    table: `CostPoliciesList`,
    filter,
    fetchData: createFetcher('marketplace-project-estimated-cost-policies'),
    queryField: 'query',
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Project'),
          render: ({ row }) => (
            <ProjectLink
              row={{ ...row, name: row.project_name, uuid: row.project_uuid }}
            />
          ),
        },
        {
          title: translate('Cost threshold'),
          render: ({ row }) => <>{defaultCurrency(row.limit_cost)}</>,
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
          render: ({ row }) => (
            <i
              className={
                row.has_fired === true
                  ? 'fa fa-check text-info'
                  : 'fa fa-times text-danger'
              }
            />
          ),
        },
        {
          title: translate('Project estimated current cost'),
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
      ]}
      verboseName={translate('Cost policies')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hoverableRow={({ row }) => (
        <CostPolicyDeleteButton row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      showPageSizeSelector={true}
      actions={<CostPolicyCreateButton refetch={tableProps.fetch} />}
    />
  );
};
