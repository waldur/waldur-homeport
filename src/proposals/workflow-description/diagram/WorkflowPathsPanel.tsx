import { FC, useMemo, useRef, useState } from 'react';
import {
  WorkflowDescription,
  WorkflowPath,
  WorkflowPathStep,
} from 'waldur-js-client';

import { Badge, Select } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { outcomeLabel } from '@/proposals/workflow/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { PanelHeaderControls } from '../PanelHeaderControls';
import { useCallWorkflowPaths, useCallWorkflowProgress } from '../queries';
import { widthOfLongest } from '../selectWidth';
import { useValidationTableExport } from '../validationExport';

const resultLabel = (result: string) =>
  ({
    active: translate('now here'),
    skipped: translate('skipped'),
    expired: translate('expired'),
    withdrawn: translate('withdrawn'),
  })[result] ?? outcomeLabel(result);

export const PathSteps: FC<{
  steps: WorkflowPathStep[];
  names: Map<string, string>;
}> = ({ steps, names }) => (
  <span>
    {steps.map((step, index) => (
      <span key={`${step.key}-${index}`}>
        {index ? <span className="text-quaternary mx-1">→</span> : null}
        <span className="text-primary">
          {names.get(step.key) ?? step.key}
        </span>{' '}
        <span
          className={
            ['ineligible', 'infeasible', 'declined', 'expired'].includes(
              step.result,
            )
              ? 'text-danger'
              : 'text-quaternary'
          }
        >
          ({resultLabel(step.result)})
        </span>
      </span>
    ))}
  </span>
);

const pathText = (steps: WorkflowPathStep[], names: Map<string, string>) =>
  steps
    .map(
      (step) =>
        `${names.get(step.key) ?? step.key} (${resultLabel(step.result)})`,
    )
    .join(' → ');

const coverageText = (row: WorkflowPath) =>
  row.covered_by_scenario == null
    ? translate('Not checked')
    : row.covered_by_scenario
      ? translate('Covered')
      : translate('No scenario');

const coverage = (row: WorkflowPath) => {
  if (row.covered_by_scenario == null) {
    return <span className="text-quaternary">{translate('Not checked')}</span>;
  }
  return row.covered_by_scenario ? (
    <Badge variant="success" tone="outline">
      {translate('Covered')}
    </Badge>
  ) : (
    <Badge variant="warning" tone="outline">
      {translate('No scenario')}
    </Badge>
  );
};

/**
 * The distinct paths a running call's proposals took through its workflow,
 * with how many took each, and whether a saved scenario walks it.
 */
export const WorkflowPathsPanel: FC<{
  description: WorkflowDescription;
  callUuid: string;
}> = ({ description, callUuid }) => {
  const [roundUuid, setRoundUuid] = useState<string | null>(null);
  const { data: progress } = useCallWorkflowProgress(callUuid, null);
  const { data, dataUpdatedAt, isLoading, isError, refetch } =
    useCallWorkflowPaths(callUuid, roundUuid);
  const names = useMemo(
    () => new Map(description.steps.map((step) => [step.key, step.name])),
    [description],
  );
  const rowsRef = useRef<WorkflowPath[]>([]);
  rowsRef.current = data?.paths ?? [];
  // A new response is a new table: the rows are already in hand.
  const filter = useMemo(
    () => ({ round: roundUuid, loaded: dataUpdatedAt }),
    [roundUuid, dataUpdatedAt],
  );
  const tableProps = useTable<WorkflowPath>({
    table: `workflow-paths-${callUuid}`,
    filter,
    fetchData: (request) => {
      const rows = rowsRef.current;
      const start = (request.currentPage - 1) * request.pageSize;
      return Promise.resolve({
        rows: rows.slice(start, start + request.pageSize),
        resultCount: rows.length,
      });
    },
  });
  const exportProps = useValidationTableExport();
  const roundOptions = useMemo(
    () => [
      { value: null, label: translate('All rounds') },
      ...(progress?.rounds ?? []).map((round) => ({
        value: round.uuid,
        label: round.name || round.uuid,
      })),
    ],
    [progress],
  );
  const columns: Column<WorkflowPath>[] = [
    {
      title: translate('Path'),
      export: (row) => pathText(row.steps, names),
      render: ({ row }) => <PathSteps steps={row.steps} names={names} />,
    },
    {
      title: translate('Proposals'),
      export: (row) => row.proposals,
      render: ({ row }) => <>{row.proposals}</>,
    },
    {
      title: translate('State'),
      export: (row) =>
        row.finished ? translate('Ended') : translate('Under way'),
      render: ({ row }) =>
        row.finished ? (
          <>{translate('Ended')}</>
        ) : (
          <>{translate('Under way')}</>
        ),
    },
    {
      title: translate('Scenario'),
      export: coverageText,
      render: ({ row }) => coverage(row),
    },
  ];
  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <LoadingErred
        loadData={() => void refetch()}
        message={translate('Paths could not be loaded.')}
      />
    );
  }
  return (
    <div data-testid="workflow-paths-panel">
      <PanelHeaderControls className="flex flex-wrap items-center gap-2.5 mb-2.5">
        <div style={{ width: widthOfLongest(roundOptions) }}>
          <Select
            aria-label={translate('Round')}
            options={roundOptions}
            value={roundOptions.find((option) => option.value === roundUuid)}
            onChange={(option: any) => setRoundUuid(option?.value ?? null)}
            isClearable={false}
            isSearchable={false}
          />
        </div>
      </PanelHeaderControls>
      <Table<WorkflowPath>
        {...tableProps}
        {...exportProps}
        showPageSizeSelector
        columns={columns}
        verboseName={translate('paths')}
        hideTitle
        hasActionBar={false}
        cardBordered={false}
        bodyClassName="p-0"
        placeholderHasRetry={false}
      />
    </div>
  );
};
