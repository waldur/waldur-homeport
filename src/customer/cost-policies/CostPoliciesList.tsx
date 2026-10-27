import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import {
  customerCreditsList,
  marketplaceProjectEstimatedCostPoliciesList,
  MarketplaceProjectEstimatedCostPoliciesListData,
} from 'waldur-js-client';

import { HelpIcon } from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { ProjectLink } from '@/project/ProjectLink';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { CostPolicyActions } from './CostPolicyActions';
import { CostPolicyCreateButton } from './CostPolicyCreateButton';
import { CostPolicyExpandableRow } from './CostPolicyExpandableRow';
import { CostPolicyTriggerCell } from './CostPolicyTriggerCell';
import { getCostPolicyActionOptions, policyPeriodOptions } from './utils';

interface CostPoliciesListTableProps extends Partial<TableProps> {
  table: string;
  hideColumns?: ('project' | 'current_cost')[];
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
    fetchData: createFetcher(marketplaceProjectEstimatedCostPoliciesList),
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
          title: translate('Resource'),
          render: ({ row }) => <>{renderFieldOrDash(row.resource_name)}</>,
        },
        {
          title: (
            <>
              {translate('Action triggered')}{' '}
              <HelpIcon
                label={translate(
                  "Whether this policy's actions are in effect, for example pausing or downscaling. The status's tooltip says why, with the figures the policy compared.",
                )}
                size={18}
              />
            </>
          ),
          render: ({ row }) => (
            <CostPolicyTriggerCell row={row}>
              {row.has_fired && row.affected_resources_count > 0 && (
                <span className="text-quaternary text-xs whitespace-nowrap">
                  {/* Whole strings per form: inflected languages do not take
                      "{count} resource(s)". */}
                  {row.affected_resources_count === 1
                    ? translate('{count} resource', { count: 1 })
                    : translate('{count} resources', {
                        count: row.affected_resources_count,
                      })}
                </span>
              )}
            </CostPolicyTriggerCell>
          ),
        },
        // No organization credit column: the list is always one
        // organization's, so it would repeat one figure on every row. The
        // organization page shows it once, as the subtitle.
        {
          title: translate('Project credit'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.project_credit ? defaultCurrency(row.project_credit) : null,
              )}
            </>
          ),
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
        !hideColumns.includes('current_cost') && {
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
      rowActions={({ row }) => (
        <CostPolicyActions
          row={row}
          type="project"
          refetch={tableProps.fetch}
        />
      )}
      expandableRow={CostPolicyExpandableRow}
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
  const customer = useCustomer();
  const filter = useMemo(() => {
    const result: MarketplaceProjectEstimatedCostPoliciesListData['query'] = {};
    if (customer) {
      result.customer_uuid = customer.uuid;
    }
    return result;
  }, [customer]);

  const { data: credit } = useQuery({
    queryKey: ['CostPoliciesOrganizationCredit', customer?.uuid],
    queryFn: () =>
      customerCreditsList({ query: { customer_uuid: customer.uuid } }).then(
        (response) => response.data[0] ?? null,
      ),
    enabled: Boolean(customer?.uuid),
    staleTime: SHORT_STALE_TIME,
  });

  return (
    <CostPoliciesListTable
      table="CostPoliciesList"
      filter={filter}
      // Dated as on the organization dashboard: this is the stored balance,
      // while a policy's tooltip gives the credit left after this month's
      // usage so far.
      subtitle={
        credit
          ? translate('Organization credit, {date} balance: {credit}', {
              date: formatDate(DateTime.now().startOf('month')),
              credit: defaultCurrency(credit.value),
            })
          : undefined
      }
    />
  );
};
