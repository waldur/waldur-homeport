import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  marketplaceProjectEstimatedCostPoliciesList,
  MarketplaceProjectEstimatedCostPoliciesListData,
} from 'waldur-js-client';

import { BooleanBadge } from '@/core/BooleanBadge';
import { defaultCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
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
import { getCostPolicyActionOptions, policyPeriodOptions } from './utils';

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
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-2">
              <BooleanBadge value={row.has_fired} />
              {row.has_fired && row.affected_resources_count > 0 && (
                <span className="text-muted fs-7">
                  {translate('{count} resources', {
                    count: row.affected_resources_count,
                  })}
                </span>
              )}
            </div>
          ),
        },
        {
          title: translate('Organization credit'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                row.customer_credit
                  ? defaultCurrency(row.customer_credit)
                  : null,
              )}
            </>
          ),
        },
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
  const customer = useCustomer();
  const filter = useMemo(() => {
    const result: MarketplaceProjectEstimatedCostPoliciesListData['query'] = {};
    if (customer) {
      result.customer_uuid = customer.uuid;
    }
    return result;
  }, [customer]);

  return <CostPoliciesListTable table="CostPoliciesList" filter={filter} />;
};
