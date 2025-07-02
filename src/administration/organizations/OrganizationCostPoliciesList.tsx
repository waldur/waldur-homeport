import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CustomerEstimatedCostPolicy,
  MarketplaceCustomerEstimatedCostPoliciesListData,
} from 'waldur-js-client';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { CostPolicyActions } from '@waldur/customer/cost-policies/CostPolicyActions';
import { CostPolicyCreateButton } from '@waldur/customer/cost-policies/CostPolicyCreateButton';
import { getCostPolicyActionOptions } from '@waldur/customer/cost-policies/utils';
import { OrganizationNameLink } from '@waldur/customer/list/OrganizationNameLink';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { OrganizationCostPoliciesFilter } from './OrganizationCostPoliciesFilter';

const filtersSelector = createSelector(
  getFormValues('OrgCostPoliciesFilter'),
  (filterValues: any) => {
    const result: MarketplaceCustomerEstimatedCostPoliciesListData['query'] =
      {};
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
    <Table<CustomerEstimatedCostPolicy>
      {...tableProps}
      columns={[
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <OrganizationNameLink
              row={{ name: row.scope_name, uuid: row.scope_uuid }}
            />
          ),

          filter: 'organization',
          inlineFilter: (row) => ({
            name: row.scope_name,
            uuid: row.scope_uuid,
          }),
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
        <CostPolicyActions
          row={row}
          type="organization"
          refetch={tableProps.fetch}
        />
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
