import { FC, useCallback, useMemo } from 'react';
import { WorkflowReportCallStep, WorkflowReportStep } from 'waldur-js-client';

import { StatCardGrid } from 'waldur-ui';

import { ChartCard } from '@/core/ChartCard';
import { formatDateTime } from '@/core/dateUtils';
import { EChart } from '@/core/EChart';
import { useChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { phaseLabel } from '@/proposals/provider-calls/providerCalls';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { barChartHeight, buildWorkflowOptions } from './charts';
import { formatDays, formatNumber } from './format';
import { CallLink, ReportTable } from './ReportTable';
import { ReportViewProps } from './types';

type StepRow = WorkflowReportStep & {
  uuid: string;
  /** The call's own plan for the step, on a call-level report. */
  planned_days?: number | null;
};

const Overdue = ({ value }: { value: number }) =>
  value ? (
    <span className="text-danger font-medium">{formatNumber(value)}</span>
  ) : (
    <>{formatNumber(value)}</>
  );

/** Steps closed without being completed: skipped, expired or withdrawn. */
const closedOtherwise = (step: {
  skipped: number;
  expired: number;
  withdrawn: number;
}) => step.skipped + step.expired + step.withdrawn;

/** The figures a step has, summed over the calls or of one call. */
type StepFigures = Pick<
  WorkflowReportStep,
  | 'total'
  | 'pending'
  | 'waiting'
  | 'overdue'
  | 'completed'
  | 'completed_late'
  | 'skipped'
  | 'expired'
  | 'withdrawn'
  | 'median_days'
  | 'p90_days'
>;

const figureColumns = <T extends StepFigures>(): Column<T>[] => [
  {
    title: translate('Total'),
    orderField: 'total',
    render: ({ row }) => <>{formatNumber(row.total)}</>,
    export: (row) => row.total,
  },
  {
    title: translate('Not started'),
    orderField: 'pending',
    render: ({ row }) => <>{formatNumber(row.pending)}</>,
    export: (row) => row.pending,
  },
  {
    title: translate('At the step now'),
    orderField: 'waiting',
    render: ({ row }) => <>{formatNumber(row.waiting)}</>,
    export: (row) => row.waiting,
  },
  {
    title: translate('Overdue'),
    orderField: 'overdue',
    render: ({ row }) => <Overdue value={row.overdue} />,
    export: (row) => row.overdue,
  },
  {
    title: translate('Completed'),
    orderField: 'completed',
    render: ({ row }) => <>{formatNumber(row.completed)}</>,
    export: (row) => row.completed,
  },
  {
    title: translate('Completed late'),
    orderField: 'completed_late',
    render: ({ row }) => <>{formatNumber(row.completed_late)}</>,
    export: (row) => row.completed_late,
  },
  {
    title: translate('Skipped, expired or withdrawn'),
    render: ({ row }) => <>{formatNumber(closedOtherwise(row))}</>,
    export: (row) => closedOtherwise(row),
  },
  {
    title: translate('Median days'),
    orderField: 'median_days',
    render: ({ row }) => <>{renderFieldOrDash(formatDays(row.median_days))}</>,
    export: (row) => formatDays(row.median_days),
  },
  {
    title: translate('Slowest 10% (days)'),
    orderField: 'p90_days',
    render: ({ row }) => <>{renderFieldOrDash(formatDays(row.p90_days))}</>,
    export: (row) => formatDays(row.p90_days),
  },
];

const plannedColumn = <
  T extends { planned_days?: number | null },
>(): Column<T> => ({
  title: translate('Planned days'),
  render: ({ row }) => <>{renderFieldOrDash(formatDays(row.planned_days))}</>,
  export: (row) => formatDays(row.planned_days),
});

type CallStepRow = WorkflowReportCallStep & { uuid: string };

/** The step in each call that has it. */
const StepCalls: FC<{ row: StepRow }> = ({ row }) => {
  const rows = row.calls.map((call) => ({ ...call, uuid: call.call_uuid }));
  // Calls of several organizations, in the reports across all of them: each
  // says whose it is.
  const severalOrganizations =
    new Set(row.calls.map((call) => call.organisation_uuid)).size > 1;
  const columns: Column<CallStepRow>[] = [
    {
      title: translate('Call'),
      rowHeader: true,
      render: ({ row: call }) => (
        <div>
          <CallLink uuid={call.call_uuid} name={call.call_name} />
          {severalOrganizations && (
            <div className="text-xs text-quaternary">
              {call.organisation_name}
            </div>
          )}
        </div>
      ),
    },
    ...figureColumns<CallStepRow>(),
    plannedColumn<CallStepRow>(),
  ];
  return (
    <div className="px-4 py-3">
      <SimpleTable<CallStepRow> columns={columns} rows={rows} />
    </div>
  );
};

export const WorkflowReportView: FC<ReportViewProps<'workflow'>> = ({
  data,
  scope,
}) => {
  const colors = useChartThemeColors();
  const callLevel = Boolean(scope.callUuid);

  const rows = useMemo<StepRow[]>(
    () =>
      data.steps.map((step) => ({
        ...step,
        uuid: step.key,
        planned_days: callLevel ? step.calls[0]?.planned_days : undefined,
      })),
    [data.steps, callLevel],
  );

  // Steps no proposal has reached say nothing about where proposals wait.
  const charted = useMemo(
    () => data.steps.filter((step) => step.total),
    [data.steps],
  );
  const options = useMemo(
    () => buildWorkflowOptions(charted, colors),
    [charted, colors],
  );

  const totals = useMemo(
    () =>
      data.steps.reduce(
        (sum, step) => ({
          waiting: sum.waiting + step.waiting,
          overdue: sum.overdue + step.overdue,
          completedLate: sum.completedLate + step.completed_late,
        }),
        { waiting: 0, overdue: 0, completedLate: 0 },
      ),
    [data.steps],
  );

  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Step'),
        translate('Median days'),
        translate('Slowest 10% (days)'),
        translate('At the step now'),
        translate('Overdue'),
      ],
      data: charted.map((step) => [
        step.name,
        step.median_days ?? '',
        step.p90_days ?? '',
        step.waiting,
        step.overdue,
      ]),
    }),
    [charted],
  );

  const columns = useMemo<Column<StepRow>[]>(
    () => [
      {
        title: translate('Step'),
        rowHeader: true,
        render: ({ row }) => (
          <div>
            <div>{row.name}</div>
            <div className="text-xs text-quaternary">
              {phaseLabel(row.phase)}
            </div>
          </div>
        ),
        export: (row) => row.name,
      },
      ...figureColumns<StepRow>(),
      ...(callLevel ? [plannedColumn<StepRow>()] : []),
    ],
    [callLevel],
  );

  return (
    <>
      <StatCardGrid
        stats={[
          {
            label: translate('Proposals in the workflow'),
            value: formatNumber(data.proposals),
          },
          {
            label: translate('At a step now'),
            value: formatNumber(totals.waiting),
          },
          {
            label: translate('Overdue'),
            value: formatNumber(totals.overdue),
          },
          {
            label: translate('Completed late'),
            value: formatNumber(totals.completedLate),
          },
        ]}
      />
      <div className="mb-5">
        <ChartCard
          title={translate('Days per step')}
          summary={translate('Figures as of {time}', {
            time: formatDateTime(data.generated_at),
          })}
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
      <ReportTable<StepRow>
        table={`CallReportsWorkflow-${scope.callUuid ?? scope.organizationUuid}`}
        rows={rows}
        columns={columns}
        title={translate('Steps')}
        verboseName={translate('steps')}
        queryField="name"
        expandableRow={callLevel ? undefined : StepCalls}
        // A bounded list in workflow order: a pager would split it.
        hasPagination={false}
      />
    </>
  );
};
