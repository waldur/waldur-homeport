import { FC, useMemo } from 'react';
import {
  CustomerEstimatedCostPolicy,
  marketplaceCustomerEstimatedCostPoliciesList,
} from 'waldur-js-client';

import { HelpIcon } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { CostPolicyActions } from '@/customer/cost-policies/CostPolicyActions';
import { CostPolicyCreateButton } from '@/customer/cost-policies/CostPolicyCreateButton';
import { CostPolicyTriggerCell } from '@/customer/cost-policies/CostPolicyTriggerCell';
import { getCostPolicyActionOptions } from '@/customer/cost-policies/utils';
import { OrganizationNameLink } from '@/customer/list/OrganizationNameLink';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  MarketplaceCustomerEstimatedCostPoliciesFilter,
  selectMarketplaceCustomerEstimatedCostPoliciesFilter,
  MarketplaceCustomerEstimatedCostPoliciesFilterFormId,
} from '@/table/generated/MarketplaceCustomerEstimatedCostPoliciesFilter';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { tabTableProps } from '../tabTableProps';

export const OrganizationCostPoliciesList: FC<Partial<TableWithPortal>> = ({
  portal,
}) => {
  const values = useFilterValues('OrgCostPoliciesList');

  const filter = useMemo(
    () => selectMarketplaceCustomerEstimatedCostPoliciesFilter(values),
    [values],
  );

  const tableProps = useTable({
    table: 'OrgCostPoliciesList',
    syncFiltersToURL: true,
    filter: filter,
    fetchData: createFetcher(marketplaceCustomerEstimatedCostPoliciesList),
    queryField: 'query',
  });

  return (
    <Table<CustomerEstimatedCostPolicy>
      {...tableProps}
      {...tabTableProps(portal)}
      columns={[
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <OrganizationNameLink
              row={{ name: row.scope_name, uuid: row.scope_uuid }}
            />
          ),

          filter: 'customer_uuid',
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
          title: (
            <>
              {translate('Action triggered')}{' '}
              <HelpIcon
                label={translate(
                  "Shows whether this policy's action has been executed (for example, pausing or downscaling) after exceeding the limit.",
                )}
                size={18}
              />
            </>
          ),
          render: ({ row }) => <CostPolicyTriggerCell row={row} />,
        },
        {
          title: translate('Credit'),
          render: ({ row }) =>
            renderFieldOrDash(
              row.customer_credit ? defaultCurrency(row.customer_credit) : null,
            ),
        },
        {
          title: translate('Cost threshold'),
          render: ({ row }) => <>{defaultCurrency(row.limit_cost)}</>,
        },
        {
          title: (
            <>
              {translate('Current cost')}{' '}
              <HelpIcon
                label={translate(
                  'The cost this policy compares with its threshold: the cost in the policy period, less what credit pays.',
                )}
                size={18}
              />
            </>
          ),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.current_cost !== null && row.current_cost !== undefined
                  ? defaultCurrency(row.current_cost)
                  : null,
              )}
            </>
          ),
        },
      ]}
      verboseName={translate('Cost policies')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      filters={<MarketplaceCustomerEstimatedCostPoliciesFilter />}
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
      formId={MarketplaceCustomerEstimatedCostPoliciesFilterFormId}
    />
  );
};
