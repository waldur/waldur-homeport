import {
  BellIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CheckIcon,
  DotOutlineIcon,
  EyeIcon,
  MinusIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback, useMemo, useRef } from 'react';
import {
  WorkflowDescription,
  WorkflowDescriptionActor,
  WorkflowDescriptionRoleCell,
  WorkflowDescriptionStep,
} from 'waldur-js-client';

import { Badge, HelpIcon, Tooltip, useNoHover } from 'waldur-ui';

import { translate } from '@/i18n';
import { StepFormPage } from '@/proposals/update/workflow-steps/stepForm';
import {
  DISABLED_STEP_ROW_CLASS,
  DisabledStepBadge,
  ParallelStepNote,
} from '@/proposals/workflow/StepGroupHeader';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';

import {
  CELL_FLAGS,
  CellFlag,
  cellFlagLabel,
  cellTarget,
  explainRef,
} from './explain';
import { daysBeforeLabel } from './mail/labels';
import { roleMatrixExportFields, roleMatrixExportRows } from './matrixExport';
import { actorTitle, applicantLabelText, conditionText } from './summary';
import { useValidationTableExport } from './validationExport';

export type OpenStep = (stepKey: string, page: StepFormPage) => void;

/** A flag in a cell, as an icon; its name is the label and the tooltip. */
const markIcon = (flag: CellFlag) =>
  ({
    sees: <EyeIcon weight="bold" size={16} />,
    reads_outputs: <BookOpenIcon weight="bold" size={16} />,
    contributes: <PencilSimpleIcon weight="bold" size={16} />,
    completes: <CheckCircleIcon weight="bold" size={16} />,
    notified: <BellIcon weight="bold" size={16} />,
  })[flag];

/** A flag in a cell, in a word. */
const markLabel = (flag: CellFlag): string =>
  ({
    sees: translate('Sees'),
    reads_outputs: translate('Reads'),
    contributes: translate('Contributes'),
    completes: translate('Completes'),
    notified: translate('Notified'),
  })[flag];

const Mark: FC<{
  flag: CellFlag;
  cell: WorkflowDescriptionRoleCell;
  description: WorkflowDescription;
  onOpenStep?: OpenStep;
}> = ({ flag, cell, description, onOpenStep }) => {
  const noHover = useNoHover();
  const value = cell[flag];
  if (!value.value) return null;
  const reasons = Array.from(
    new Set(value.because.map((ref) => explainRef(ref, description))),
  );
  const triggers =
    flag === 'notified'
      ? cell.notified.triggers
          .map((t) =>
            t.days_before != null
              ? translate('{trigger}, {when}', {
                  trigger: t.trigger,
                  when: daysBeforeLabel(t.days_before),
                })
              : t.trigger,
          )
          .join('; ')
      : '';
  const target = cellTarget(cell, flag);
  const label = (
    <div className="text-start">
      <div className="font-semibold">{cellFlagLabel(flag)}</div>
      {triggers && <div>{triggers}</div>}
      {reasons.map((reason) => (
        <div key={reason}>{reason}</div>
      ))}
    </div>
  );
  const onClick =
    target && onOpenStep
      ? () => onOpenStep(target.step, target.page)
      : undefined;
  const opens = Boolean(onClick);
  // One of a fixed set of values, so a badge in the word; a button, so its
  // "why" tooltip opens on keyboard focus too.
  return (
    <Tooltip label={label} trigger={noHover && !opens ? 'click' : 'hover'}>
      <Badge
        as="button"
        variant="neutral"
        size="lg"
        leftIcon={markIcon(flag)}
        shape="pill"
        tone="outline"
        onlyIcon
        aria-label={cellFlagLabel(flag)}
        aria-haspopup={opens ? 'dialog' : undefined}
        className={classNames(!opens && 'cursor-help')}
        data-testid={`matrix-mark-${flag}`}
        onClick={onClick}
      />
    </Tooltip>
  );
};

const StepCell: FC<{
  step: WorkflowDescriptionStep;
  description: WorkflowDescription;
}> = ({ step, description }) => {
  const condition = step.run_condition;
  const mates = description.steps.filter((s) => s.stage === step.stage);
  const applicantName = applicantLabelText(
    step.applicant.label_kind,
    step.name,
  );
  return (
    <div>
      <div className="text-primary">
        {step.name}
        {mates.length > 1 && <ParallelStepNote />}
        {/* What the applicant sees the step called, when not its name. */}
        {applicantName !== step.name && (
          <HelpIcon
            className="ms-1"
            label={translate('Applicants see this step as "{name}".', {
              name: applicantName,
            })}
          />
        )}
      </div>
      {!step.enabled && (
        <div className="mt-1">
          <DisabledStepBadge />
        </div>
      )}
      {condition && (
        <div className="text-quaternary text-sm">
          {translate('Only if {condition}', {
            condition: conditionText({
              stepName:
                description.steps.find((s) => s.key === condition.step)?.name ??
                condition.step,
              outcomes: condition.outcomes,
              scoreSpreadAbove: condition.score_spread_above,
            }),
          })}
        </div>
      )}
    </div>
  );
};

const RoleCell: FC<{
  step: WorkflowDescriptionStep;
  actor: WorkflowDescriptionActor;
  description: WorkflowDescription;
  onOpenStep?: OpenStep;
}> = ({ step, actor, description, onOpenStep }) => {
  const cell = step.roles.find((c) => c.actor === actor.key);
  if (!cell) return null;
  const all = [...CELL_FLAGS, 'notified' as const];
  const flags = all.filter((flag) => cell[flag].value);
  // Read as "Applicant: Sees the step, Reads its outputs".
  // One line per cell, every part shown: the table scrolls sideways rather
  // than wrap a role's badges into rows of uneven height.
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-nowrap gap-1">
        {flags.length > 0 && (
          <span className="sr-only">
            {translate('{role}:', { role: actorTitle(actor) })}{' '}
          </span>
        )}
        {all.map((flag) =>
          cell[flag].value ? (
            <Mark
              key={flag}
              flag={flag}
              cell={cell}
              description={description}
              onOpenStep={onOpenStep}
            />
          ) : (
            // No access: only a dot, in a slot the size of a badge, so each
            // part keeps its place down the column.
            <span
              key={flag}
              className="inline-flex size-7 min-w-7 items-center justify-center"
              aria-hidden="true"
            >
              <DotOutlineIcon
                weight="fill"
                size={16}
                // A muted mark, not text: the border token.
                color="var(--border-primary)"
              />
            </span>
          ),
        )}
      </div>
    </div>
  );
};

/** Yes or no as an icon-only pill, as the auto-provisioning rules list
 * shows it (`RulesList`'s BooleanIconBadge). */
const HasPartBadge: FC<{ value: boolean }> = ({ value }) => (
  <Badge
    variant={value ? 'success' : 'neutral'}
    shape="pill"
    tone="outline"
    onlyIcon
    aria-label={value ? translate('Yes') : translate('No')}
  >
    {value ? (
      <CheckIcon weight="bold" size={12} />
    ) : (
      <MinusIcon weight="bold" size={12} />
    )}
  </Badge>
);

interface RoleMatrixProps {
  description: WorkflowDescription;
  hideDisabled?: boolean;
  actorKey?: string | null;
  onOpenStep?: OpenStep;
}

/**
 * Who sees, reads, contributes to, completes and is told about each step:
 * the step × role matrix of the workflow description.
 */
export const RoleMatrix: FC<RoleMatrixProps> = ({
  description,
  hideDisabled,
  actorKey,
  onOpenStep,
}) => {
  const rows = useMemo(
    () => description.steps.filter((step) => !hideDisabled || step.enabled),
    [description, hideDisabled],
  );
  const actors = useMemo(
    () =>
      description.actors.filter((actor) => !actorKey || actor.key === actorKey),
    [description, actorKey],
  );
  // Read when exporting, which the table set up on its first render.
  const exportRef = useRef({ description, actors });
  exportRef.current = { description, actors };
  const tableProps = useRowsTable('WorkflowRoleMatrix', rows, rows, {
    exportFields: roleMatrixExportFields,
    exportData: (steps) =>
      roleMatrixExportRows(
        steps,
        exportRef.current.description,
        exportRef.current.actors.map((actor) => actor.key),
      ),
  });
  const exportProps = useValidationTableExport();
  // The opener changes identity as a dialog opens (the modal's own
  // callbacks do); the columns must not, or every cell remounts and the mark
  // focused when the step dialog opened is gone when it closes, dropping
  // focus to the page. So the columns call the latest opener through a ref.
  const openRef = useRef(onOpenStep);
  openRef.current = onOpenStep;
  const canOpen = Boolean(onOpenStep);
  const openStep = useCallback<OpenStep>(
    (stepKey, page) => openRef.current?.(stepKey, page),
    [],
  );
  const columns = useMemo<Column<WorkflowDescriptionStep>[]>(
    () => [
      {
        id: 'step',
        title: translate('Step'),
        ellipsis: false,
        // Each mark is announced with the step it belongs to.
        rowHeader: true,
        render: ({ row }) => <StepCell step={row} description={description} />,
      },
      ...(actorKey
        ? // One role: the same parts, a column each, as a permission table.
          [...CELL_FLAGS, 'notified' as const].map((flag) => ({
            id: flag,
            title: markLabel(flag),
            render: ({ row }: { row: WorkflowDescriptionStep }) => (
              <HasPartBadge
                value={Boolean(
                  row.roles.find((c) => c.actor === actorKey)?.[flag].value,
                )}
              />
            ),
          }))
        : actors.map((actor) => ({
            id: actor.key,
            title: actorTitle(actor),
            // Badges on one line: an ellipsis would cut them off.
            ellipsis: false,
            render: ({ row }: { row: WorkflowDescriptionStep }) => (
              <RoleCell
                step={row}
                actor={actor}
                description={description}
                onOpenStep={canOpen ? openStep : undefined}
              />
            ),
          }))),
    ],
    [actors, actorKey, description, canOpen, openStep],
  );
  return (
    <Table<WorkflowDescriptionStep>
      {...tableProps}
      {...exportProps}
      showPageSizeSelector
      columns={columns}
      verboseName={translate('Workflow steps')}
      rowClass={({ row }) => (row.enabled ? '' : DISABLED_STEP_ROW_CLASS)}
      // The step stays in view while the roles scroll sideways.
      pinnedColumnKeys={['step']}
      hideTitle
      hasActionBar={false}
      cardBordered={false}
      bodyClassName="p-0"
      placeholderHasRetry={false}
    />
  );
};

/**
 * What the marks mean, in a row: each mark's badge as the cells show it,
 * then its name, and the dot of a part a role does not have.
 */
export const RoleMatrixLegend: FC = () => (
  <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
    {[...CELL_FLAGS, 'notified' as const].map((flag) => (
      <span key={flag} className="inline-flex items-center gap-1">
        <Badge
          variant="neutral"
          size="lg"
          leftIcon={markIcon(flag)}
          shape="pill"
          tone="outline"
          onlyIcon
          aria-hidden="true"
        />
        {markLabel(flag)}
      </span>
    ))}
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-flex size-7 min-w-7 items-center justify-center"
        aria-hidden="true"
      >
        <DotOutlineIcon
          weight="fill"
          size={16}
          // A muted mark, not text: the border token.
          color="var(--border-primary)"
        />
      </span>
      {translate('No access')}
    </span>
  </span>
);
