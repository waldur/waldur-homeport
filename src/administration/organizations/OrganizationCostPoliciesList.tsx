import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  CustomerEstimatedCostPolicy,
  marketplaceCustomerEstimatedCostPoliciesList,
} from 'waldur-js-client';

import { BooleanBadge } from '@/core/BooleanBadge';
import { defaultCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
import { CostPolicyActions } from '@/customer/cost-policies/CostPolicyActions';
import { CostPolicyCreateButton } from '@/customer/cost-policies/CostPolicyCreateButton';
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
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

export const OrganizationCostPoliciesList: FC = () => {
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
          title: (
            <>
              {translate('Action triggered')}{' '}
              <Tip
                id="action-triggered-tooltip"
                label={translate(
                  "Shows whether this policy's action has been executed (for example, pausing or downscaling) after exceeding the limit.",
                )}
              >
                <QuestionIcon size={18} weight="bold" />
              </Tip>
            </>
          ),
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
