import { Check, X } from '@phosphor-icons/react';
import { FC } from 'react';
import { Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { Table, createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
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
              row={{ ...row, name: row.scope_name, uuid: row.scope_uuid }}
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
          render: ({ row }) =>
            row.has_fired === true ? (
              <Badge
                bg={null}
                className="fs-8 fw-bolder lh-base badge-light-danger badge-pill"
              >
                <X size={12} className="text-danger me-2" />
                {translate('No')}
              </Badge>
            ) : (
              <Badge
                bg={null}
                className="fs-8 fw-bolder lh-base badge-light-success badge-pill"
              >
                <Check size={12} className="text-success me-2" />
                {translate('Yes')}
              </Badge>
            ),
        },
        !hideColumns.includes('price_estimate') && {
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
      ].filter(Boolean)}
      verboseName={translate('Cost policies')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      rowActions={({ row }) => (
        <CostPolicyDeleteButton
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
