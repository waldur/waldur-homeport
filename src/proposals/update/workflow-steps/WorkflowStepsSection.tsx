import { LockSimpleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsList,
  ResponsibleRoleEnum,
} from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { Call } from '../../types';
import {
  callLockedTooltip,
  getStepDefinitions,
  responsibleRoleLabel,
  stepDefinition,
  TransitionModeEnum,
  transitionModeLabel,
} from '../../workflow/constants';

import { WorkflowSequencePreview } from './WorkflowSequencePreview';
import { WorkflowStepConfigureAction } from './WorkflowStepConfigureAction';
import { WorkflowStepCreateButton } from './WorkflowStepCreateButton';
import { WorkflowStepDeleteAction } from './WorkflowStepDeleteAction';
import { WorkflowStepExpandableRow } from './WorkflowStepExpandableRow';
import { WorkflowStepToggleAction } from './WorkflowStepToggleAction';

interface WorkflowStepsSectionProps {
  call: Call;
  isReadOnly?: boolean;
}

// A mandatory step rendered from the catalog when the call has no backend row
// for it. The backfill migration (0056) deliberately skipped active/archived
// calls, so those keep an empty CallWorkflowStep set even though the preview
// always shows the mandatory step. Surfacing it here keeps the table and the
// preview consistent without mutating in-flight workflow data.
type MaybeSynthetic = CallWorkflowStep & { _synthetic?: boolean };

const isSyntheticStep = (row: CallWorkflowStep): boolean =>
  Boolean((row as MaybeSynthetic)._synthetic);

const makeSyntheticStep = (id: CallWorkflowStep['step']): MaybeSynthetic => {
  const def = stepDefinition(id);
  return {
    uuid: `synthetic-${id}`,
    step: id,
    is_enabled: true,
    duration_in_days: null,
    responsible_role: def?.defaultResponsibleRole ?? null,
    transition_mode: 'automatic_on_completion',
    _synthetic: true,
  } as MaybeSynthetic;
};

const StepNameCell = ({ row }: { row: CallWorkflowStep }) => {
  const def = stepDefinition(row.step);
  const name = def?.name ?? row.step;
  return (
    <div className="d-flex align-items-center gap-2">
      {def?.mandatory && (
        <Tip
          id={`workflow-step-${row.uuid}-mandatory`}
          label={translate('Mandatory step. Cannot be removed.')}
        >
          <LockSimpleIcon className="text-muted" size={14} weight="bold" />
        </Tip>
      )}
      <span className="fw-semibold">{name}</span>
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
  // Backend-managed rows (e.g. award_response is provisioned by Allocation
  // Decision's include_award_response toggle) expose only Configure.
  // Toggle/Delete would diverge from the toggle state on the next save.
  const def = stepDefinition(row.step);
  const isManagedByToggle = Boolean(def?.managedByToggle);
  const actions = [
    ({ row, refetch }) => (
      <WorkflowStepConfigureAction row={row} call={call} refetch={refetch} />
    ),
    ...(isManagedByToggle
      ? []
      : [
          ({ row, refetch }) => (
            <WorkflowStepToggleAction
              row={row}
              call={call}
              steps={steps}
              refetch={refetch}
            />
          ),
          ({ row, refetch }) => (
            <WorkflowStepDeleteAction row={row} call={call} refetch={refetch} />
          ),
        ]),
  ];
  return <ActionsDropdown row={row} refetch={fetch} actions={actions} />;
};

export const WorkflowStepsSection: FC<WorkflowStepsSectionProps> = ({
  call,
  isReadOnly,
}) => {
  const tableProps = useTable({
    table: 'CallWorkflowSteps',
    fetchData: createFetcher(proposalProtectedCallsWorkflowStepsList, {
      path: { uuid: call.uuid },
    }),
  });

  const sortedRows = useMemo(() => {
    const catalogOrder = new Map(getStepDefinitions().map((d, i) => [d.id, i]));
    const indexFor = (s: CallWorkflowStep) =>
      s.display_order ?? catalogOrder.get(s.step) ?? 99;
    const backendRows = [...(tableProps.rows ?? [])]
      // Backend soft-disables toggle-managed steps (sets is_enabled=false)
      // instead of deleting; hide those rows so the table reflects the
      // configured workflow without a confusing ghost row.
      .filter((r: CallWorkflowStep) => {
        const def = stepDefinition(r.step);
        return !(def?.managedByToggle && !r.is_enabled);
      });
    // Surface mandatory catalog steps the call has no backend row for, so the
    // table matches the preview (which always renders mandatory steps).
    const present = new Set(backendRows.map((r) => r.step));
    const syntheticRows = getStepDefinitions()
      .filter((def) => def.mandatory && !present.has(def.id))
      .map((def) => makeSyntheticStep(def.id));
    return [...backendRows, ...syntheticRows].sort(
      (a: CallWorkflowStep, b: CallWorkflowStep) => indexFor(a) - indexFor(b),
    );
  }, [tableProps.rows]);

  // The catalog is bounded (≤ getStepDefinitions().length) and never
  // server-paginated, so reflect the client-filtered count back to the
  // table footer/pagination — otherwise it reports the raw backend total
  // (e.g. "of 7") while a soft-disabled toggle row is hidden from view.
  const pagination = useMemo(
    () => ({ ...tableProps.pagination, resultCount: sortedRows.length }),
    [tableProps.pagination, sortedRows.length],
  );

  const columns: Column<CallWorkflowStep>[] = [
    {
      title: translate('Step'),
      render: StepNameCell,
    },
    {
      title: translate('Description'),
      render: ({ row }) => {
        const description = stepDefinition(row.step)?.description;
        return description ? (
          <span className="text-muted">{description}</span>
        ) : (
          renderFieldOrDash(null)
        );
      },
    },
    {
      title: translate('Duration (days)'),
      render: ({ row }) => renderFieldOrDash(row.duration_in_days),
    },
    {
      title: translate('Responsible role'),
      render: ({ row }) =>
        responsibleRoleLabel(
          row.responsible_role as ResponsibleRoleEnum | null,
        ),
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

  const rowClass = ({ row }: { row: CallWorkflowStep }) => {
    const def = stepDefinition(row.step);
    return !row.is_enabled && !def?.mandatory ? 'opacity-50' : '';
  };

  return (
    <>
      <Table<CallWorkflowStep>
        {...tableProps}
        rows={sortedRows}
        pagination={pagination}
        columns={columns}
        title={translate('Steps & settings')}
        verboseName={translate('Workflow steps')}
        tableActions={
          <WorkflowStepCreateButton
            call={call}
            configuredSteps={sortedRows}
            refetch={tableProps.fetch}
            disabled={isReadOnly}
            tooltip={isReadOnly ? callLockedTooltip() : undefined}
          />
        }
        rowActions={({ row, fetch }) =>
          isReadOnly ? (
            <ActionsDropdown disabled tooltip={callLockedTooltip()} />
          ) : isSyntheticStep(row) ? (
            <ActionsDropdown
              disabled
              tooltip={translate(
                'This mandatory step is shown by default and is configured automatically once the call workflow is set up.',
              )}
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
      />
      <div className="mt-5">
        <WorkflowSequencePreview
          steps={sortedRows}
          onReset={() => tableProps.fetch(true)}
        />
      </div>
    </>
  );
};
