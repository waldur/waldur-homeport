import { FC, useCallback, useMemo } from 'react';
import { NestedRound, RoundReportRow } from 'waldur-js-client';

import { Badge, BadgeVariant, StatCardGrid } from 'waldur-ui';

import { ChartCard } from '@/core/ChartCard';
import { EChart } from '@/core/EChart';
import { useChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { getRoundLifecycleState } from '@/proposals/roundLifecycle';
import { getRoundStatus } from '@/proposals/utils';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import {
  barChartHeight,
  buildRoundTimelineOptions,
  hasRoundSpans,
  roundLabel,
} from './charts';
import {
  formatDays,
  formatNumber,
  formatOptionalDate,
  formatSignedDays,
} from './format';
import { organizationColumns } from './organizationColumn';
import { CallLink, ReportTable, RoundLink } from './ReportTable';
import { ReportViewProps } from './types';

type RoundRow = RoundReportRow & { uuid: string };

/** The stage a round is at now; a closed round is at none. */
const getStage = (
  row: RoundRow,
): { label: string; color: BadgeVariant } | null => {
  switch (row.current_stage) {
    case 'scheduled':
    case 'open':
      return getRoundStatus({ status: row.current_stage } as NestedRound);
    case 'awaiting_evaluation':
      return { label: translate('Awaiting evaluation'), color: 'warning' };
    // A round of a call that is not active is at no stage: muted, never open.
    case 'call_archived':
      return { label: translate('Call archived'), color: 'neutral' };
    case 'call_draft':
      return { label: translate('Call draft'), color: 'neutral' };
    case 'evaluating':
    case 'deciding':
    case 'results_published':
      return getRoundLifecycleState(row.current_stage);
    default:
      return getRoundLifecycleState('closed');
  }
};

/** "Evaluating · 12 days": the stage, and how long the round has been at it. */
const stageText = (row: RoundRow) => {
  const stage = getStage(row);
  if (!stage) return '';
  return row.days_in_current_stage === null
    ? stage.label
    : translate('{stage} · {days} days', {
        stage: stage.label,
        days: formatDays(row.days_in_current_stage),
      });
};

const CurrentStage = ({ row }: { row: RoundRow }) => {
  const stage = getStage(row);
  if (!stage) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={stage.color} size="sm" shape="pill" tone="outline">
        {stage.label}
      </Badge>
      {row.days_in_current_stage !== null && (
        <span className="whitespace-nowrap">
          {translate('{days} days', {
            days: formatDays(row.days_in_current_stage),
          })}
        </span>
      )}
    </div>
  );
};

/** Days after the allocation date, flagged when results came late. */
const AllocationDelay = ({ row }: { row: RoundRow }) => {
  if (row.days_after_allocation_date === null) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={row.late ? 'text-danger font-medium' : undefined}>
        {formatSignedDays(row.days_after_allocation_date)}
      </span>
      {row.late && (
        <Badge variant="danger" size="sm" shape="pill" tone="outline">
          {row.results_published_at
            ? translate('Late')
            : translate('Late, unpublished')}
        </Badge>
      )}
    </div>
  );
};

export const RoundsReportView: FC<ReportViewProps<'rounds'>> = ({
  data,
  scope,
}) => {
  const colors = useChartThemeColors();
  const callLevel = Boolean(scope.callUuid);
  const { totals } = data;

  const rows = useMemo<RoundRow[]>(
    () => data.rounds.map((round) => ({ ...round, uuid: round.round_uuid })),
    [data.rounds],
  );
  const charted = useMemo(
    () => data.rounds.filter(hasRoundSpans),
    [data.rounds],
  );
  const options = useMemo(
    () => buildRoundTimelineOptions(charted, colors, !callLevel),
    [charted, colors, callLevel],
  );

  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Round'),
        translate('Cut-off to evaluation'),
        translate('Evaluating'),
        translate('Deciding'),
        translate('Current stage'),
      ],
      data: charted.map((round) => [
        roundLabel(round, !callLevel),
        round.days_cutoff_to_evaluation ?? '',
        round.days_evaluating ?? '',
        round.days_deciding ?? '',
        stageText({ ...round, uuid: round.round_uuid }),
      ]),
    }),
    [charted, callLevel],
  );

  const columns = useMemo<Column<RoundRow>[]>(
    () => [
      {
        title: translate('Round'),
        orderField: 'round_name',
        rowHeader: true,
        render: ({ row }) => (
          <RoundLink callUuid={row.call_uuid} name={row.round_name} />
        ),
        export: (row) => row.round_name,
      },
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
            } as Column<RoundRow>,
          ]),
      ...organizationColumns<RoundRow>(scope, data.rounds),
      {
        title: translate('Current stage'),
        render: CurrentStage,
        export: stageText,
      },
      {
        title: translate('Submitted proposals'),
        orderField: 'proposals_submitted',
        render: ({ row }) => <>{formatNumber(row.proposals_submitted)}</>,
        export: (row) => row.proposals_submitted,
      },
      {
        title: translate('Cut-off'),
        orderField: 'cutoff_time',
        render: ({ row }) => (
          <>{renderFieldOrDash(formatOptionalDate(row.cutoff_time))}</>
        ),
        export: (row) => formatOptionalDate(row.cutoff_time),
      },
      {
        title: translate('Results published'),
        orderField: 'results_published_at',
        render: ({ row }) => (
          <>{renderFieldOrDash(formatOptionalDate(row.results_published_at))}</>
        ),
        export: (row) => formatOptionalDate(row.results_published_at),
      },
      {
        title: translate('Days from cut-off to results'),
        orderField: 'days_cutoff_to_published',
        render: ({ row }) => (
          <>{renderFieldOrDash(formatDays(row.days_cutoff_to_published))}</>
        ),
        export: (row) => formatDays(row.days_cutoff_to_published),
      },
      {
        title: translate('Allocation date'),
        orderField: 'allocation_date',
        render: ({ row }) => (
          <>{renderFieldOrDash(formatOptionalDate(row.allocation_date))}</>
        ),
        export: (row) => formatOptionalDate(row.allocation_date),
      },
      {
        title: translate('Days after allocation date'),
        orderField: 'days_after_allocation_date',
        render: AllocationDelay,
        export: (row) => formatSignedDays(row.days_after_allocation_date),
      },
    ],
    [callLevel, scope, data.rounds],
  );

  return (
    <>
      <StatCardGrid
        stats={[
          {
            label: translate('Rounds'),
            value: formatNumber(totals.rounds),
          },
          {
            label: translate('Results published'),
            value: formatNumber(totals.published),
          },
          {
            label: translate('Late against the allocation date'),
            value: formatNumber(totals.late),
          },
          {
            label: translate('Median days from cut-off to results'),
            value: renderFieldOrDash(
              formatDays(totals.median_days_cutoff_to_published),
            ),
          },
        ]}
      />
      <div className="mb-5">
        <ChartCard
          title={translate('From cut-off to results')}
          summary={translate(
            'The stages of each round since its cut-off. The hatched segment is the stage a round is at now, up to today.',
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
      <ReportTable<RoundRow>
        table={`CallReportsRounds-${scope.callUuid ?? scope.organizationUuid}`}
        rows={rows}
        columns={columns}
        title={translate('Rounds')}
        verboseName={translate('rounds')}
        queryField="round_name"
      />
    </>
  );
};
