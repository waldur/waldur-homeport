import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { CostPolicyCreateButton } from '@waldur/customer/cost-policies/CostPolicyCreateButton';
import { CostPolicyDeleteButton } from '@waldur/customer/cost-policies/CostPolicyDeleteButton';
import { CostPolicyEditButton } from '@waldur/customer/cost-policies/CostPolicyEditButton';
import { getCostPolicyActionOptions } from '@waldur/customer/cost-policies/utils';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { OrganizationCostPoliciesFilter } from './OrganizationCostPoliciesFilter';

const filtersSelector = createSelector(
  getFormValues('OrgCostPoliciesFilter'),
  (filterValues: any) => {
    const result: Record<string, any> = {};
    if (filterValues?.organization) {
      result.customer_uuid = filterValues.organization.uuid;
    }
    return result;
  },
);

export const OrganizationCostPoliciesList: FC = () => {
  const filter = useSelector(filtersSelector);

  const tableProps = useTable({
    table: 'OrgCostPoliciesList',
    filter: filter,
    fetchData: createFetcher('marketplace-customer-estimated-cost-policies'),
    queryField: 'query',
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <OrganizationLink
              row={{ name: row.scope_name, uuid: row.scope_uuid }}
            />
          ),
          filter: 'organization',
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
          title: translate('Credit'),
          render: ({ row }) =>
            row.customer_credit ? defaultCurrency(row.customer_credit) : 'N/A',
        },
        {
          title: translate('Cost threshold'),
          render: ({ row }) => <>{defaultCurrency(row.limit_cost)}</>,
        },
        {
          title: translate('Estimated cost'),
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
      filters={<OrganizationCostPoliciesFilter />}
      rowActions={({ row }) => (
        <>
          <CostPolicyEditButton
            row={row}
            type="organization"
            refetch={tableProps.fetch}
          />
          <CostPolicyDeleteButton
            row={row}
            type="organization"
            refetch={tableProps.fetch}
          />
        </>
      )}
      hasQuery={true}
      showPageSizeSelector={true}
      tableActions={
        <CostPolicyCreateButton
          type="organization"
          refetch={tableProps.fetch}
        />
      }
    />
  );
};
