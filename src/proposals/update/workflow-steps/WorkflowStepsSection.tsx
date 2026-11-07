import { LockSimpleIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsList,
  ResponsibleRoleEnum,
} from 'waldur-js-client';

import { Badge, HelpIcon, Tabs, TabsList, TabsTrigger } from 'waldur-ui';

import { translate } from '@/i18n';
import { getCallReadOnlyReason } from '@/proposals/utils';
import {
  DISABLED_STEP_ROW_CLASS,
  DisabledStepBadge,
  parallelRowClass,
  ParallelStepNote,
  stepGroupHeader,
  phaseHint,
  phaseTitle,
} from '@/proposals/workflow/StepGroupHeader';
import { WorkflowCheckSummary } from '@/proposals/workflow-check/WorkflowCheckSummary';
import {
  callWorkflowCheckKey,
  callWorkflowDescriptionKey,
  callWorkflowHistoryKey,
  useCallWorkflowCheck,
} from '@/proposals/workflow-description/queries';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { StaffingWarning } from '../../proposal-roles/StaffingWarning';
import { Call } from '../../types';
import {
  kindLabel,
  responsibleRoleLabel,
  sortByOrder,
  stepName,
  TransitionModeEnum,
  transitionModeLabel,
} from '../../workflow/constants';
import { useWorkflowStepKinds } from '../../workflow/queries';
import { stagePositions, WorkflowPhaseKey } from '../../workflow/stages';

import { AddAwardResponseButton } from './AddAwardResponseButton';
import { WorkflowStepsContext } from './StepEvaluators';
import { WorkflowSequencePreview } from './WorkflowSequencePreview';
import { WorkflowStepConfigureAction } from './WorkflowStepConfigureAction';
import { WorkflowStepCreateButton } from './WorkflowStepCreateButton';
import { WorkflowStepDeleteAction } from './WorkflowStepDeleteAction';
import { WorkflowStepExpandableRow } from './WorkflowStepExpandableRow';
import { WorkflowStepMoveAction } from './WorkflowStepMoveAction';
import { WorkflowStepToggleAction } from './WorkflowStepToggleAction';

interface WorkflowStepsSectionProps {
  call: Call;
  isReadOnly?: boolean;
  // Pure read-only presentation (e.g. the call-manage dashboard): drops the
  // Add button, the per-row actions column, and the preview's reset control,
  // leaving just the steps table + sequence preview. Distinct from isReadOnly,
  // which keeps those controls visible-but-disabled (archived call edit).
  viewOnly?: boolean;
}

const StepNameCell = ({
  row,
  inStage,
}: {
  row: CallWorkflowStep;
  inStage: boolean;
}) => {
  // A dimmed row alone does not say *why* it is dimmed, and the table has no
  // room for a status column, so the state is spelled out next to the name.
  // Only the off state is labelled: tagging every other row "Enabled" would
  // be noise on a table whose rows are mostly enabled.
  const disabled = !row.is_enabled && !row.is_mandatory;
  // The stage and the phase are shown by the group header rows above the
  // step; the name and the badges wrap rather than being cut off. Who does
  // what is in the expanded row, field by field.
  return (
    <div className="step-name-cell__content">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-medium text-primary">{stepName(row)}</span>
        {row.is_mandatory && (
          <Badge
            variant="neutral"
            size="sm"
            leftIcon={<LockSimpleIcon weight="bold" />}
            rightIcon={
              <HelpIcon
                size={14}
                label={translate(
                  'The allocation decision. Every call runs exactly one, so it cannot be removed.',
                )}
              />
            }
            shape="pill"
            tone="outline"
          >
            {translate('Cannot be removed')}
          </Badge>
        )}
        {inStage && <ParallelStepNote />}
        {disabled && <DisabledStepBadge />}
        {!disabled && (
          <StaffingWarning warning={row.contributors_warning} compact />
        )}
      </div>
    </div>
  );
};

const StepRowActions = ({
  row,
  fetch,
  call,
  steps,
}: {
  row: CallWorkflowStep;
  fetch(): void;
  call: Call;
  steps: CallWorkflowStep[];
}) => {
  const actions = [
    ({ row, refetch }) => (
      <WorkflowStepConfigureAction row={row} call={call} refetch={refetch} />
    ),
    ({ row, refetch }) => (
      <WorkflowStepMoveAction
        row={row}
        call={call}
        steps={steps}
        direction="up"
        refetch={refetch}
      />
    ),
    ({ row, refetch }) => (
      <WorkflowStepMoveAction
        row={row}
        call={call}
        steps={steps}
        direction="down"
        refetch={refetch}
      />
    ),
    ({ row, refetch }) => (
      <WorkflowStepToggleAction
        row={row}
        call={call}
        steps={steps}
        refetch={refetch}
      />
    ),
    ({ row, refetch }) => (
      <WorkflowStepDeleteAction
        row={row}
        call={call}
        steps={steps}
        refetch={refetch}
      />
    ),
  ];
  return <ActionsDropdown row={row} refetch={fetch} actions={actions} />;
};

export const WorkflowStepsSection: FC<WorkflowStepsSectionProps> = ({
  call,
  isReadOnly,
  viewOnly,
}) => {
  const tableProps = useTable({
    table: 'CallWorkflowSteps',
    fetchData: createFetcher(proposalProtectedCallsWorkflowStepsList, {
      path: { uuid: call.uuid },
    }),
  });
  const { data: kinds } = useWorkflowStepKinds();
  const { data: check } = useCallWorkflowCheck(call.uuid, !viewOnly);

  // The order the engine runs the steps in. The backend already lists them
  // so; sorting again keeps the table right while a move is being saved.
  const sortedRows = useMemo(
    () => sortByOrder<CallWorkflowStep>(tableProps.rows ?? []),
    [tableProps.rows],
  );

  // The evaluation's path; the steps of an extension or of the closing run
  // later, on the accepted proposal, each in a run of its own.
  const evaluationRows = useMemo(
    () =>
      sortedRows.filter((row) => (row.phase ?? 'evaluation') === 'evaluation'),
    [sortedRows],
  );

  // The evaluation and the runs after the award, each a tab of its own,
  // its description behind the tab's hint.
  const phases = useMemo(
    () => [
      ...new Set(
        sortedRows.map(
          (row) => (row.phase ?? 'evaluation') as WorkflowPhaseKey,
        ),
      ),
    ],
    [sortedRows],
  );
  const [chosenPhase, setPhase] = useState<WorkflowPhaseKey>('evaluation');
  // The rows keep the height of the tallest stage seen, so switching to a
  // shorter one does not make the block jump.
  const tableRef = useRef<HTMLDivElement>(null);
  const [rowsFloor, setRowsFloor] = useState(0);
  const choosePhase = (key: WorkflowPhaseKey) => {
    const rows =
      tableRef.current?.querySelector<HTMLElement>('.table-responsive');
    setRowsFloor((floor) => Math.max(floor, rows?.offsetHeight ?? 0));
    setPhase(key);
  };
  const phase = phases.includes(chosenPhase) ? chosenPhase : phases[0];
  const phaseRows = useMemo(
    () =>
      phases.length > 1
        ? sortedRows.filter((row) => (row.phase ?? 'evaluation') === phase)
        : sortedRows,
    [sortedRows, phases, phase],
  );

  // Which steps run together, so the table can group them under a header.
  const stages = useMemo(() => stagePositions(sortedRows), [sortedRows]);
  const stageKey = useCallback(
    (row: CallWorkflowStep) => stages.get(row.uuid)?.stage,
    [stages],
  );

  // Any change to the steps -- a move, a toggle, a new or deleted step --
  // changes what the description says.
  const queryClient = useQueryClient();
  const stepsSignature = useMemo(
    () => JSON.stringify(tableProps.rows ?? []),
    [tableProps.rows],
  );
  useEffect(() => {
    for (const queryKey of [
      callWorkflowDescriptionKey(call.uuid),
      callWorkflowCheckKey(call.uuid),
      callWorkflowHistoryKey(call.uuid),
    ]) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [stepsSignature, queryClient, call.uuid]);

  const columns: Column<CallWorkflowStep>[] = [
    {
      title: translate('Step'),
      // Badges and the summary wrap; an ellipsis would cut them off.
      ellipsis: false,
      className: 'step-name-cell',
      render: ({ row }) => (
        <StepNameCell
          row={row}
          inStage={(stages.get(row.uuid)?.size ?? 0) > 1}
        />
      ),
    },
    {
      title: translate('Kind'),
      render: ({ row }) => (
        <span className="text-quaternary">{kindLabel(kinds, row.kind)}</span>
      ),
    },
    {
      title: translate('Duration (days)'),
      render: ({ row }) => renderFieldOrDash(row.duration_in_days),
    },
    {
      title: translate('Responsible role'),
      render: ({ row }) =>
        responsibleRoleLabel(row.completer as ResponsibleRoleEnum | null),
    },
    {
      title: translate('Transition'),
      render: ({ row }) =>
        transitionModeLabel(
          (row.transition_mode ||
            'automatic_on_completion') as TransitionModeEnum | null,
        ),
    },
  ];

  // The expanded rows manage each step's people against the call.
  const stepsContext = useMemo(
    () => ({ call, steps: sortedRows, isReadOnly, viewOnly }),
    [call, sortedRows, isReadOnly, viewOnly],
  );

  const rowClass = ({ row }: { row: CallWorkflowStep }) =>
    classNames(
      parallelRowClass(phaseRows, row, stageKey),
      !row.is_enabled && !row.is_mandatory && DISABLED_STEP_ROW_CLASS,
    );
  const rowGroupHeader = ({ rowIndex }: { rowIndex: number }) =>
    stepGroupHeader(phaseRows, rowIndex, stageKey, false);

  return (
    <WorkflowStepsContext.Provider value={stepsContext}>
      {check && !viewOnly && (
        <WorkflowCheckSummary check={check} className="mb-5" />
      )}
      <div ref={tableRef}>
        <Table<CallWorkflowStep>
          {...tableProps}
          minHeight={rowsFloor || undefined}
          rows={phaseRows}
          nav={
            phases.length > 1 ? (
              <Tabs
                value={phase}
                onValueChange={(key) => choosePhase(key as WorkflowPhaseKey)}
              >
                {/* Spaced like the table's own tabs (TableNav). */}
                <TabsList className="pt-3">
                  {phases.map((key) => (
                    <TabsTrigger key={key} value={key} hint={phaseHint(key)}>
                      {phaseTitle(key)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : undefined
          }
          // Every step, in the order the workflow runs them: the endpoint is
          // not paginated, and the stages and moves read the whole list.
          hasPagination={false}
          columns={columns}
          title={translate('Steps & settings')}
          verboseName={translate('Workflow steps')}
          tableActions={
            viewOnly ? undefined : (
              <>
                <AddAwardResponseButton
                  call={call}
                  steps={sortedRows}
                  refetch={tableProps.fetch}
                  disabled={isReadOnly}
                  tooltip={isReadOnly ? getCallReadOnlyReason(call) : undefined}
                />
                <WorkflowStepCreateButton
                  call={call}
                  steps={sortedRows}
                  refetch={tableProps.fetch}
                  disabled={isReadOnly}
                  tooltip={isReadOnly ? getCallReadOnlyReason(call) : undefined}
                />
              </>
            )
          }
          rowActions={
            viewOnly
              ? undefined
              : ({ row, fetch }) =>
                  isReadOnly ? (
                    <ActionsDropdown
                      disabled
                      tooltip={getCallReadOnlyReason(call)}
                    />
                  ) : (
                    <StepRowActions
                      row={row}
                      fetch={fetch}
                      call={call}
                      steps={sortedRows}
                    />
                  )
          }
          expandableRow={WorkflowStepExpandableRow}
          rowClass={rowClass}
          rowGroupHeader={rowGroupHeader}
        />
      </div>
      {!viewOnly && (
        <p className="text-quaternary text-xs mt-2.5 mb-0">
          {translate(
            'A change of order applies to proposals submitted from now on; proposals already submitted keep the path they were submitted with. Steps marked Extension or Final report run after the award, each time the team requests an extension and once for the final report.',
          )}
        </p>
      )}
      <div className="mt-4">
        <WorkflowSequencePreview
          steps={evaluationRows}
          onReset={viewOnly ? undefined : () => tableProps.fetch(true)}
        />
      </div>
    </WorkflowStepsContext.Provider>
  );
};
