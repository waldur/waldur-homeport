import { FC, useCallback, useMemo } from 'react';
import { BudgetReportPool } from 'waldur-js-client';

import { Badge, EmptyState, StatCardGrid, Tooltip } from 'waldur-ui';

import { ChartCard } from '@/core/ChartCard';
import { EChart } from '@/core/EChart';
import { Link } from '@/core/Link';
import { useChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import {
  componentUnit,
  formatDemandAmount,
} from '@/proposals/provider-calls/offeringDemand';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { describeBudget, isOverspent, orderBudgetRows } from './budgetRows';
import {
  barChartHeight,
  buildPoolOptions,
  countBudgets,
  poolLabel,
} from './charts';
import { formatNumber, formatShare } from './format';
import { organizationColumns } from './organizationColumn';
import { CALL_REPORT_PARAMS_CLEARED } from './reportParams';
import { CallLink, ReportTable, RoundLink } from './ReportTable';
import { ReportViewProps } from './types';

type PoolRow = BudgetReportPool & { uuid: string };

const formatAmount = (pool: BudgetReportPool, value: number | null) =>
  formatDemandAmount(value, componentUnit(pool));

/** A cell of an amount in the pool's unit; a dash where there is none. */
const amountColumn = (
  title: string,
  field: keyof BudgetReportPool,
): Column<PoolRow> => ({
  title,
  orderField: field,
  render: ({ row }) => (
    <span className="whitespace-nowrap">
      {renderFieldOrDash(formatAmount(row, row[field] as number | null))}
    </span>
  ),
  export: (row) => (row[field] as number | null) ?? '',
});

const rowKey = (pool: BudgetReportPool) =>
  [
    pool.call_uuid,
    pool.round_uuid ?? 'call',
    pool.pool_uuid ?? pool.offering_name,
    pool.component_type,
  ].join(':');

/** Which budget the row is, and how it nests under the call-wide pool. */
const PoolCell = ({ row }: { row: PoolRow }) => {
  if (!row.round_uuid) {
    return (
      <Tooltip
        label={translate(
          'One pool shared by every round of this call. Awards in all rounds count against it.',
        )}
      >
        <span className="font-medium whitespace-nowrap">
          {translate('Call-wide pool')}
        </span>
      </Tooltip>
    );
  }
  return (
    <div className={row.within_call_pool ? 'pl-4' : undefined}>
      <RoundLink callUuid={row.call_uuid} name={row.round_name} />
      {row.within_call_pool ? (
        <div className="text-xs text-quaternary">
          {translate('Part of the call-wide pool')}
        </div>
      ) : !row.pool_uuid ? (
        <div className="text-xs text-quaternary">
          {translate('No pool of its own')}
        </div>
      ) : null}
    </div>
  );
};

/** What the pool has left, or by how much its awards went past it. */
const Remaining = ({ row }: { row: PoolRow }) =>
  isOverspent(row) ? (
    <span className="whitespace-nowrap font-medium text-danger">
      {translate('Over by {amount}', {
        amount: formatAmount(row, -row.remaining),
      })}
    </span>
  ) : (
    <span className="whitespace-nowrap">
      {renderFieldOrDash(formatAmount(row, row.remaining))}
    </span>
  );

/** The share of the offer awarded; past the whole offer, a warning instead. */
const AwardedShare = ({ row }: { row: PoolRow }) =>
  isOverspent(row) ? (
    <Badge
      variant="danger"
      size="sm"
      shape="pill"
      tone="outline"
      tooltip={translate('{share} of what the pool offers', {
        share: formatShare(row.awarded_share),
      })}
    >
      {translate('Over budget')}
    </Badge>
  ) : (
    <>{renderFieldOrDash(formatShare(row.awarded_share))}</>
  );

/** Why there is nothing to measure the awards against, and where to fix it. */
const NoPoolsNote: FC<{ callUuid?: string; roundChosen: boolean }> = ({
  callUuid,
  roundChosen,
}) => (
  <EmptyState
    className="mb-5"
    title={translate('No resource pools')}
    message={
      roundChosen
        ? translate(
            'This round has no resource pools, so there is nothing to measure awards against. Requests and awards are listed below.',
          )
        : callUuid
          ? translate(
              'This call has no resource pools, so there is nothing to measure awards against. Requests and awards are listed below.',
            )
          : translate(
              'These calls have no resource pools, so there is nothing to measure awards against. Requests and awards are listed below.',
            )
    }
    action={
      callUuid ? (
        <Link
          state="protected-call.manage"
          params={{ ...CALL_REPORT_PARAMS_CLEARED, tab: 'resource-pools' }}
        >
          {translate('Open resource pools')}
        </Link>
      ) : undefined
    }
  />
);

export const BudgetsReportView: FC<ReportViewProps<'budgets'>> = ({
  data,
  scope,
  filters,
}) => {
  const colors = useChartThemeColors();
  const callLevel = Boolean(scope.callUuid);
  // Every row is a budget of its own, except a round's pool within a
  // call-wide pool: its awards count in the call's row too, so it is marked
  // and left out of the totals.
  const rows = useMemo<PoolRow[]>(
    () =>
      orderBudgetRows(data.pools).map((pool) => ({
        ...pool,
        uuid: rowKey(pool),
      })),
    [data.pools],
  );

  // Only a pool has an offer to measure the awards against. Rows without one
  // list what was asked for and awarded outside any pool.
  const charted = useMemo(
    () => data.pools.filter((pool) => pool.pool_uuid && pool.offered_total),
    [data.pools],
  );
  const options = useMemo(
    () => buildPoolOptions(charted, colors, !callLevel, formatAmount),
    [charted, colors, callLevel],
  );

  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Pool'),
        translate('Unit'),
        translate('Offered'),
        translate('Awarded'),
        translate('Asked for, undecided'),
        translate('Remaining'),
      ],
      data: charted.map((pool) => [
        poolLabel(pool, !callLevel),
        componentUnit(pool),
        pool.offered_total,
        pool.awarded,
        pool.undecided,
        pool.remaining ?? '',
      ]),
    }),
    [charted, callLevel],
  );

  const budgets = useMemo(() => countBudgets(data.pools), [data.pools]);

  // Without a pool, only what was asked for and awarded can be counted:
  // amounts in different units do not add up, so the tiles count rows.
  const hasPools = useMemo(
    () => data.pools.some((pool) => pool.pool_uuid),
    [data.pools],
  );
  const requestCounts = useMemo(
    () => ({
      offerings: new Set(data.pools.map((pool) => pool.offering_name)).size,
      awarded: data.pools.filter((pool) => pool.awarded > 0).length,
      undecided: data.pools.filter((pool) => pool.undecided > 0).length,
    }),
    [data.pools],
  );

  // A column every row would repeat says nothing: the call when the filters
  // name one, the round when they name one and no row is the whole call's.
  const showCall = !(
    (filters?.calls?.length === 1 || filters?.round) &&
    new Set(data.pools.map((pool) => pool.call_uuid)).size <= 1
  );
  const showRound = !(
    filters?.round &&
    data.pools.every((pool) => pool.round_uuid === filters.round)
  );

  const columns = useMemo<Column<PoolRow>[]>(
    () => [
      ...(callLevel
        ? []
        : [
            {
              title: translate('Call'),
              orderField: 'call_name',
              render: ({ row }) => (
                <CallLink uuid={row.call_uuid} name={row.call_name} />
              ),
              export: (row) => row.call_name,
              // Hidden when every row is of the one call the filters name;
              // still exported, so the file says which call it is.
              visible: showCall,
            } as Column<PoolRow>,
          ]),
      ...organizationColumns<PoolRow>(scope, data.pools),
      {
        // Which budget the row is: the call's, a round's own pool, or a
        // round's share of the call's.
        title: translate('Pool'),
        render: ({ row }) => <PoolCell row={row} />,
        export: (row) => describeBudget(row),
        // Hidden, but exported, when every row is of the chosen round.
        visible: showRound,
      } as Column<PoolRow>,
      {
        title: translate("Within the call's pool"),
        render: ({ row }) => (
          <>{row.within_call_pool ? translate('Yes') : translate('No')}</>
        ),
        export: (row) =>
          row.within_call_pool ? translate('Yes') : translate('No'),
        // Shown under the round's name; a column of its own in exports only.
        visible: false,
      },
      {
        title: translate('Offering'),
        orderField: 'offering_name',
        rowHeader: true,
        render: ({ row }) => (
          <div>
            <div>{row.offering_name}</div>
            <div className="text-xs text-quaternary">{row.component_name}</div>
          </div>
        ),
        export: (row) => `${row.offering_name} · ${row.component_name}`,
      },
      // With no pool at all, what a pool offers and has left says nothing:
      // the columns go, and the note above the table says why.
      ...(hasPools
        ? [
            {
              title: translate('Offered'),
              orderField: 'offered_total',
              render: ({ row }) =>
                row.pool_uuid ? (
                  <span className="whitespace-nowrap">
                    {renderFieldOrDash(formatAmount(row, row.offered_total))}
                  </span>
                ) : (
                  <Tooltip label={translate('No pool')}>
                    <span className="text-quaternary">{DASH_ESCAPE_CODE}</span>
                  </Tooltip>
                ),
              export: (row) =>
                row.pool_uuid
                  ? (row.offered_total ?? '')
                  : translate('No pool'),
            } as Column<PoolRow>,
          ]
        : []),
      amountColumn(translate('Requested'), 'requested'),
      amountColumn(translate('Awarded'), 'awarded'),
      amountColumn(translate('Asked for, undecided'), 'undecided'),
      ...(hasPools
        ? [
            {
              title: translate('Remaining'),
              orderField: 'remaining',
              render: Remaining,
              export: (row) => row.remaining ?? '',
            } as Column<PoolRow>,
            {
              title: translate('Awarded share'),
              orderField: 'awarded_share',
              render: AwardedShare,
              export: (row) => formatShare(row.awarded_share),
            } as Column<PoolRow>,
          ]
        : []),
    ],
    [callLevel, showCall, showRound, hasPools, scope, data.pools],
  );

  return (
    <>
      {hasPools ? (
        <>
          <StatCardGrid
            stats={[
              { label: translate('Pools'), value: formatNumber(budgets.pools) },
              {
                label: translate('Pools used up'),
                value: formatNumber(budgets.usedUp),
              },
              {
                label: translate('Pools with undecided requests'),
                value: formatNumber(budgets.undecided),
              },
            ]}
          />
          <div className="mb-5">
            <ChartCard
              title={translate('Pool use')}
              summary={translate(
                'Shares of what each pool offers. Pools are offered in different units, so only shares compare.',
              )}
              getExportData={getExportData}
              isEmpty={!charted.length}
              chartHeight={barChartHeight(charted.length)}
            >
              {(ref) => (
                <EChart
                  ref={ref}
                  options={options}
                  height={barChartHeight(charted.length)}
                />
              )}
            </ChartCard>
          </div>
        </>
      ) : (
        <>
          <NoPoolsNote
            callUuid={scope.callUuid}
            roundChosen={Boolean(filters?.round)}
          />
          <StatCardGrid
            stats={[
              {
                label: translate('Offerings requested'),
                value: formatNumber(requestCounts.offerings),
              },
              {
                label: translate('Components awarded'),
                value: formatNumber(requestCounts.awarded),
              },
              {
                label: translate('Components with undecided requests'),
                value: formatNumber(requestCounts.undecided),
              },
            ]}
          />
        </>
      )}
      <ReportTable<PoolRow>
        table={`CallReportsBudgets-${scope.callUuid ?? scope.organizationUuid}`}
        rows={rows}
        columns={columns}
        title={
          hasPools
            ? translate('Pools and awards')
            : translate('Requests and awards')
        }
        verboseName={translate('pools')}
        queryField="offering_name"
      />
    </>
  );
};
