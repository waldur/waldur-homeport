import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  CustomerCredit,
  marketplaceCustomerEstimatedCostPoliciesList,
  marketplaceProjectEstimatedCostPoliciesList,
  ProjectCredit,
} from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { CostPolicyDetailsButton } from '@/customer/cost-policies/CostPolicyDetailsButton';
import { CostPolicyFixButton } from '@/customer/cost-policies/CostPolicyFixButton';
import { CostPolicyTriggerCell } from '@/customer/cost-policies/CostPolicyTriggerCell';
import {
  getCostPolicyActionOptions,
  policyPeriodOptions,
} from '@/customer/cost-policies/utils';
import { translate } from '@/i18n';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface PolicyRow {
  row;
  type: 'project' | 'organization';
}

/** The cost policies a credit pays into.
 *
 * A project credit pays its project's cost, so it affects that project's
 * credit-aware policies, and the organization's policies, which count every
 * project. An organization credit affects all of them.
 */
const fetchPolicies = async (
  credit: CustomerCredit | ProjectCredit,
): Promise<PolicyRow[]> => {
  const projectUuid = 'project_uuid' in credit ? credit.project_uuid : null;
  const customerUuid = credit.customer_uuid;
  const [projectPolicies, organizationPolicies] = await Promise.all([
    marketplaceProjectEstimatedCostPoliciesList({
      query: projectUuid
        ? { project_uuid: projectUuid, page_size: 100 }
        : { customer_uuid: customerUuid, page_size: 100 },
    }).then((response) => response.data),
    marketplaceCustomerEstimatedCostPoliciesList({
      query: { customer_uuid: customerUuid, page_size: 100 },
    })
      .then((response) => response.data)
      // Organization policies may not be visible to this user.
      .catch(() => []),
  ]);
  return [
    ...projectPolicies
      .filter((policy) => policy.use_credit !== false)
      .map((row) => ({ row, type: 'project' as const })),
    ...organizationPolicies.map((row) => ({
      row,
      type: 'organization' as const,
    })),
  ];
};

const PoliciesTable: FC<{ uuid: string; rows: PolicyRow[] }> = ({
  uuid,
  rows,
}) => {
  const tableProps = useTable({
    table: `credit-cost-policies-${uuid}`,
    fetchData: createClientPaginatedFetcher(rows),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [rows]);
  return (
    <Table<PolicyRow>
      {...tableProps}
      columns={[
        {
          title: translate('Policy'),
          render: ({ row }) => (
            <>
              {row.type === 'project'
                ? row.row.scope_name
                : translate('{name} (organization)', {
                    name: row.row.scope_name,
                  })}
            </>
          ),
        },
        {
          title: translate('Action'),
          render: ({ row }) => (
            <>
              {getCostPolicyActionOptions().find(
                (option) => option.value === row.row.actions,
              )?.label ?? row.row.actions}
            </>
          ),
        },
        {
          title: translate('Period'),
          render: ({ row }) => (
            <>
              {Object.values(policyPeriodOptions).find(
                (option) => option.value === row.row.period,
              )?.label ?? row.row.period_name}
            </>
          ),
        },
        {
          title: translate('Limit'),
          render: ({ row }) => <>{defaultCurrency(row.row.limit_cost)}</>,
        },
        {
          title: translate('Status'),
          render: ({ row }) => <CostPolicyTriggerCell row={row.row} />,
        },
      ]}
      rowActions={({ row }) => (
        <ActionsMenu>
          <CostPolicyDetailsButton
            row={row.row}
            type={row.type}
            refetch={tableProps.fetch}
          />
          <CostPolicyFixButton
            row={row.row}
            type={row.type}
            refetch={tableProps.fetch}
          />
        </ActionsMenu>
      )}
      verboseName={translate('cost policies')}
      hideTitle
      hasActionBar={false}
      initialPageSize={5}
      minHeight="auto"
      cardBordered={false}
      bodyClassName="p-0"
      placeholderHasRetry={false}
    />
  );
};

export const CreditCostPolicies: FC<{
  credit: CustomerCredit | ProjectCredit;
}> = ({ credit }) => {
  const { data } = useQuery({
    queryKey: ['CreditCostPolicies', credit.uuid],
    queryFn: () => fetchPolicies(credit),
    refetchOnWindowFocus: false,
  });
  if (!data) {
    return null;
  }
  return (
    <div className="mt-4" data-testid="credit-cost-policies">
      <h4 className="text-sm font-semibold mb-2">
        {translate('Cost policies this credit affects')}
      </h4>
      {data.length ? (
        <PoliciesTable uuid={credit.uuid} rows={data} />
      ) : (
        <p className="text-quaternary mb-0">
          {translate('No cost policy takes this credit into account.')}
        </p>
      )}
    </div>
  );
};
