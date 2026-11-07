import { FC, useMemo } from 'react';
import {
  CallOfferingComponentBounds,
  CallPoolSummary,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import {
  componentLabel,
  componentUnit,
  formatDemandAmount,
} from '@/proposals/provider-calls/offeringDemand';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

type RequestComponents = Pick<ProviderRequestedOffering, 'components'>;

/** The component's name on the offering, else its key. */
const getComponentName = (row: RequestComponents, type: string): string => {
  const component = row.components?.find((item) => item.type === type);
  return component ? componentLabel(component) : type;
};

/** The request's plan, or that the call has not chosen one yet. */
export const getRequestPlanName = (
  row: Pick<ProviderRequestedOffering, 'plan' | 'plan_details'>,
): string =>
  row.plan && row.plan_details?.name
    ? row.plan_details.name
    : translate('Call’s plan not chosen yet');

const amount = (value: number | null, unit: string) =>
  value === null || value === undefined
    ? renderFieldOrDash(null)
    : formatDemandAmount(value, unit) || String(value);

const RulesTable: FC<{ row: ProviderRequestedOffering }> = ({ row }) => {
  const rules = row.component_rules ?? [];
  const filter = useMemo(() => ({ uuid: row.uuid }), [row.uuid]);
  const tableProps = useTable({
    table: `offering-request-rules-${row.uuid}`,
    fetchData: () =>
      Promise.resolve({ rows: rules, resultCount: rules.length }),
    filter,
  });
  return (
    <Table<CallOfferingComponentBounds>
      {...tableProps}
      // A short list, shown whole.
      hasPagination={false}
      minHeight="auto"
      columns={[
        {
          title: translate('Component'),
          render: ({ row: rule }) => (
            <div className="flex flex-col">
              <span className="font-medium text-primary">
                {getComponentName(row, rule.component_type)}
              </span>
              <span className="text-quaternary">{componentUnit(rule)}</span>
            </div>
          ),
        },
        {
          title: translate('Minimum'),
          render: ({ row: rule }) => (
            <>{amount(rule.min_per_proposal, rule.measured_unit)}</>
          ),
        },
        {
          title: translate('Maximum'),
          render: ({ row: rule }) => (
            <>{amount(rule.max_per_proposal, rule.measured_unit)}</>
          ),
        },
        {
          title: translate('Default'),
          render: ({ row: rule }) => (
            <>
              {amount(rule.default_amount, rule.measured_unit)}
              {rule.is_fixed ? (
                <span className="text-quaternary ms-1">
                  {translate('(fixed)')}
                </span>
              ) : null}
            </>
          ),
        },
      ]}
      verboseName={translate('component rules')}
      emptyMessage={translate(
        'The call sets no bounds: a proposal may ask for any amount.',
      )}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

const PoolsTable: FC<{ row: ProviderRequestedOffering }> = ({ row }) => {
  const pools = row.pools ?? [];
  const filter = useMemo(() => ({ uuid: row.uuid }), [row.uuid]);
  const tableProps = useTable({
    table: `offering-request-pools-${row.uuid}`,
    fetchData: () =>
      Promise.resolve({ rows: pools, resultCount: pools.length }),
    filter,
  });
  const unitOf = (type: string) =>
    row.components?.find((item) => item.type === type)?.measured_unit ?? '';
  return (
    <Table<CallPoolSummary>
      {...tableProps}
      // A short list, shown whole.
      hasPagination={false}
      minHeight="auto"
      columns={[
        {
          title: translate('Component'),
          render: ({ row: pool }) => (
            <>{getComponentName(row, pool.component_type)}</>
          ),
        },
        {
          title: translate('Round'),
          render: ({ row: pool }) => (
            <>{pool.round_name || translate('Whole call')}</>
          ),
        },
        {
          title: translate('Awarded in total'),
          render: ({ row: pool }) => (
            <>{amount(pool.offered_total, unitOf(pool.component_type))}</>
          ),
        },
      ]}
      verboseName={translate('pools')}
      emptyMessage={translate('The call sets no pool for this offering.')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

/**
 * What the provider commits to by accepting: the plan proposals are
 * provisioned on, what each proposal may ask of each component, and how
 * much the call awards in all.
 */
export const OfferingRequestCommitments: FC<{
  row: ProviderRequestedOffering;
}> = ({ row }) => (
  <div data-testid="offering-request-commitments">
    <PropertyList variant="summary" termWidth="sm">
      <PropertyItem label={translate('Plan')} value={getRequestPlanName(row)} />
    </PropertyList>
    <h5 className="mt-3 mb-1.5">{translate('What a proposal may ask for')}</h5>
    <RulesTable row={row} />
    <h5 className="mt-3 mb-1.5">{translate('What the call awards')}</h5>
    <PoolsTable row={row} />
  </div>
);
