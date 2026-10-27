import { FC, useEffect } from 'react';

import { Badge } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { ResetScenario } from './costPolicyDetails';

/** What would reset the policy's actions: each change, the cost after credit
 * it leaves, and whether that is at or below the limit. */
export const CostPolicyResetTable: FC<{
  policyUuid: string;
  scenarios: ResetScenario[];
}> = ({ policyUuid, scenarios }) => {
  const tableProps = useTable({
    table: `cost-policy-reset-scenarios-${policyUuid}`,
    fetchData: () =>
      Promise.resolve({ rows: scenarios, resultCount: scenarios.length }),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [scenarios]);

  return (
    <Table<ResetScenario>
      {...tableProps}
      columns={[
        {
          title: translate('If'),
          render: ({ row }) => (
            <div className="whitespace-normal">
              <div>{row.change}</div>
              {row.note ? (
                <div className="text-quaternary text-xs">{row.note}</div>
              ) : null}
            </div>
          ),
        },
        {
          title: translate('Cost after credit then'),
          render: ({ row }) => (
            <>{row.costAfter === null ? '—' : defaultCurrency(row.costAfter)}</>
          ),
        },
        {
          title: translate('Actions reset'),
          render: ({ row }) => (
            <Badge
              variant={row.resets ? 'success' : 'danger'}
              size="sm"
              shape="pill"
              tone="outline"
            >
              {row.resets ? translate('Yes') : translate('No')}
            </Badge>
          ),
        },
      ]}
      verboseName={translate('changes')}
      hideTitle
      hasActionBar={false}
      hasPagination={false}
      cardBordered={false}
      bodyClassName="p-0"
      minHeight="auto"
      placeholderHasRetry={false}
    />
  );
};
