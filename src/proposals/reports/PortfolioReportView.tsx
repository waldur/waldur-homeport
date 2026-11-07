import { FC, useCallback, useMemo } from 'react';
import {
  PortfolioReportBlock,
  PortfolioReportCall,
  PortfolioReportRound,
} from 'waldur-js-client';

import { Badge, StatCardGrid } from 'waldur-ui';

import { ChartCard } from '@/core/ChartCard';
import { EChart } from '@/core/EChart';
import { useChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { CALL_STATE_VARIANT } from '@/proposals/call-tabs';
import { CallState } from '@/proposals/types';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import {
  barChartHeight,
  buildMonthsOptions,
  buildOutcomesOptions,
  fillMonths,
  OutcomeUnit,
} from './charts';
import {
  formatNumber,
  formatOptionalDate,
  formatScore,
  formatShare,
} from './format';
import { organizationColumns, showsOrganization } from './organizationColumn';
import { CallLink, ReportTable, RoundLink } from './ReportTable';
import { ReportViewProps } from './types';

const inEvaluation = (block: PortfolioReportBlock) =>
  block.awaiting_review + block.in_review;

const SuccessRate = ({ block }: { block: PortfolioReportBlock }) =>
  block.decided ? (
    <div>
      <div>{formatShare(block.success_rate)}</div>
      <div className="text-xs text-quaternary whitespace-nowrap">
        {translate('{accepted} of {decided} decided', {
          accepted: formatNumber(block.accepted),
          decided: formatNumber(block.decided),
        })}
      </div>
    </div>
  ) : (
    <>{renderFieldOrDash(null)}</>
  );

const callStateLabel = (state: string) =>
  ({
    active: translate('Active'),
    draft: translate('Draft'),
    archived: translate('Archived'),
  })[state] ?? state;

/** The figures every call and round of the portfolio has. */
const blockColumns = <T extends PortfolioReportBlock>(): Column<T>[] => [
  {
    title: translate('Proposals'),
    orderField: 'proposals',
    render: ({ row }) => <>{formatNumber(row.proposals)}</>,
    export: (row) => row.proposals,
  },
  {
    title: translate('Submitted'),
    orderField: 'submitted',
    render: ({ row }) => <>{formatNumber(row.submitted)}</>,
    export: (row) => row.submitted,
  },
  {
    title: translate('In evaluation'),
    render: ({ row }) => <>{formatNumber(inEvaluation(row))}</>,
    export: (row) => inEvaluation(row),
  },
  {
    title: translate('Accepted'),
    orderField: 'accepted',
    render: ({ row }) => <>{formatNumber(row.accepted)}</>,
    export: (row) => row.accepted,
  },
  {
    title: translate('Rejected'),
    orderField: 'rejected',
    render: ({ row }) => <>{formatNumber(row.rejected)}</>,
    export: (row) => row.rejected,
  },
  {
    title: translate('Withdrawn or canceled'),
    render: ({ row }) => <>{formatNumber(row.canceled)}</>,
    export: (row) => row.canceled,
  },
  {
    title: translate('Success rate'),
    orderField: 'success_rate',
    render: ({ row }) => <SuccessRate block={row} />,
    export: (row) =>
      row.decided
        ? translate('{rate} ({accepted} of {decided} decided)', {
            rate: formatShare(row.success_rate),
            accepted: row.accepted,
            decided: row.decided,
          })
        : '',
  },
  {
    title: translate('Mean score'),
    orderField: 'mean_score',
    render: ({ row }) => <>{renderFieldOrDash(formatScore(row.mean_score))}</>,
    export: (row) => formatScore(row.mean_score),
  },
];

type CallRow = PortfolioReportCall & { uuid: string };
type RoundRow = PortfolioReportRound & { uuid: string; call_uuid: string };

const roundColumns = (): Column<RoundRow>[] => [
  {
    title: translate('Round'),
    orderField: 'round_name',
    rowHeader: true,
    render: ({ row }) => (
      <div>
        <RoundLink callUuid={row.call_uuid} name={row.round_name} />
        <div className="text-xs text-quaternary whitespace-nowrap">
          {translate('Cut-off: {date}', {
            date: renderFieldOrDash(formatOptionalDate(row.cutoff_time)),
          })}
        </div>
      </div>
    ),
    export: (row) => row.round_name,
  },
  ...blockColumns<RoundRow>(),
];

const toRoundRows = (call: PortfolioReportCall): RoundRow[] =>
  call.rounds.map((round) => ({
    ...round,
    uuid: round.round_uuid,
    call_uuid: call.call_uuid,
  }));

const CallRounds: FC<{ row: CallRow }> = ({ row }) => (
  <div className="px-4 py-3">
    <SimpleTable<RoundRow> columns={roundColumns()} rows={toRoundRows(row)} />
  </div>
);

export const PortfolioReportView: FC<ReportViewProps<'portfolio'>> = ({
  data,
  scope,
  filters,
}) => {
  const colors = useChartThemeColors();
  const callLevel = Boolean(scope.callUuid);
  const { totals } = data;

  // On a call, its rounds are what compare; across an organization, its calls.
  const withOrganization = showsOrganization(scope, data.calls);
  const units = useMemo<OutcomeUnit[]>(
    () =>
      callLevel
        ? (data.calls[0]?.rounds ?? [])
            .filter((round) => round.proposals)
            .map((round) => ({ name: round.round_name, block: round }))
        : data.calls
            .filter((call) => call.proposals)
            .map((call) => ({
              // Across organizations, whose call it is.
              name: withOrganization
                ? `${call.call_name} · ${call.organisation_name}`
                : call.call_name,
              block: call,
            })),
    [data, callLevel, withOrganization],
  );

  const outcomesOptions = useMemo(
    () => buildOutcomesOptions(units, colors),
    [units, colors],
  );
  const months = useMemo(
    () => fillMonths(data.months, filters?.from, filters?.to),
    [data.months, filters?.from, filters?.to],
  );
  const monthsOptions = useMemo(
    () => buildMonthsOptions(months, colors),
    [months, colors],
  );

  const getOutcomesExport = useCallback(
    () => ({
      fields: [
        callLevel ? translate('Round') : translate('Call'),
        translate('Draft'),
        translate('Awaiting review'),
        translate('In review'),
        translate('Accepted'),
        translate('Rejected'),
        translate('Withdrawn or canceled'),
      ],
      data: units.map((unit) => [
        unit.name,
        unit.block.draft,
        unit.block.awaiting_review,
        unit.block.in_review,
        unit.block.accepted,
        unit.block.rejected,
        unit.block.canceled,
      ]),
    }),
    [units, callLevel],
  );

  const getMonthsExport = useCallback(
    () => ({
      fields: [
        translate('Month'),
        translate('Submitted'),
        translate('Accepted'),
      ],
      data: months.map((month) => [
        month.month,
        month.submitted,
        month.accepted,
      ]),
    }),
    [months],
  );

  const callRows = useMemo<CallRow[]>(
    () => data.calls.map((call) => ({ ...call, uuid: call.call_uuid })),
    [data.calls],
  );
  const roundRows = useMemo<RoundRow[]>(
    () => (data.calls[0] ? toRoundRows(data.calls[0]) : []),
    [data.calls],
  );

  const callColumns = useMemo<Column<CallRow>[]>(
    () => [
      {
        title: translate('Call'),
        orderField: 'call_name',
        rowHeader: true,
        render: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <CallLink uuid={row.call_uuid} name={row.call_name} />
            {row.call_state !== 'active' && (
              <Badge
                variant={CALL_STATE_VARIANT[row.call_state as CallState]}
                size="sm"
                shape="pill"
                tone="outline"
              >
                {callStateLabel(row.call_state)}
              </Badge>
            )}
          </div>
        ),
        export: (row) => row.call_name,
      },
      ...organizationColumns<CallRow>(scope, data.calls),
      ...blockColumns<CallRow>(),
      {
        title: translate('Open rounds'),
        orderField: 'active_rounds',
        render: ({ row }) => <>{formatNumber(row.active_rounds)}</>,
        export: (row) => row.active_rounds,
      },
    ],
    [scope, data.calls],
  );
  const roundTableColumns = useMemo(roundColumns, []);

  return (
    <>
      <StatCardGrid
        stats={[
          {
            label: translate('Proposals'),
            value: formatNumber(totals.proposals),
            footer: (
              <span className="text-xs text-quaternary">
                {translate('Drafts: {count}', {
                  count: formatNumber(totals.draft),
                })}
              </span>
            ),
          },
          {
            label: translate('Submitted'),
            value: formatNumber(totals.submitted),
          },
          {
            label: translate('In evaluation'),
            value: formatNumber(inEvaluation(totals)),
            footer: (
              <span className="text-xs text-quaternary">
                {translate('Awaiting review: {count}', {
                  count: formatNumber(totals.awaiting_review),
                })}
              </span>
            ),
          },
          {
            label: translate('Accepted'),
            value: formatNumber(totals.accepted),
            footer: (
              <span className="text-xs text-quaternary">
                {translate('Rejected: {count}', {
                  count: formatNumber(totals.rejected),
                })}
              </span>
            ),
          },
          {
            label: translate('Success rate'),
            value: renderFieldOrDash(formatShare(totals.success_rate)),
            footer: (
              <span className="text-xs text-quaternary">
                {translate('{accepted} of {decided} decided', {
                  accepted: formatNumber(totals.accepted),
                  decided: formatNumber(totals.decided),
                })}
              </span>
            ),
          },
          {
            label: translate('Mean review score'),
            value: renderFieldOrDash(formatScore(totals.mean_score)),
            footer: (
              <span className="text-xs text-quaternary">
                {translate('Scored reviews: {count}', {
                  count: formatNumber(totals.scored_reviews),
                })}
              </span>
            ),
          },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard
          title={
            callLevel
              ? translate('Outcomes per round')
              : translate('Outcomes per call')
          }
          getExportData={getOutcomesExport}
          isEmpty={!units.length}
          chartHeight={barChartHeight(units.length)}
        >
          {(ref) => (
            <EChart
              ref={ref}
              options={outcomesOptions}
              height={barChartHeight(units.length)}
            />
          )}
        </ChartCard>
        <ChartCard
          title={translate('Submissions per month')}
          getExportData={getMonthsExport}
          isEmpty={!data.months.length}
          chartHeight="300px"
        >
          {(ref) => <EChart ref={ref} options={monthsOptions} height="300px" />}
        </ChartCard>
      </div>
      {callLevel ? (
        <ReportTable<RoundRow>
          table={`CallReportsPortfolioRounds-${scope.callUuid}`}
          rows={roundRows}
          columns={roundTableColumns}
          title={translate('Rounds')}
          verboseName={translate('rounds')}
          queryField="round_name"
        />
      ) : (
        <ReportTable<CallRow>
          table={`CallReportsPortfolio-${scope.organizationUuid}`}
          rows={callRows}
          columns={callColumns}
          title={translate('Calls')}
          verboseName={translate('calls')}
          queryField="call_name"
          expandableRow={CallRounds}
        />
      )}
    </>
  );
};
