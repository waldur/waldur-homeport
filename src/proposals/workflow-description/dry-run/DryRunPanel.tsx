import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CaretLeftIcon,
  BookmarkSimpleIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  FileTextIcon,
  MegaphoneIcon,
  NotePencilIcon,
  PaperPlaneTiltIcon,
  ShareFatIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  FC,
  Fragment,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import {
  DryRunActionRequest,
  DryRunLogEntry,
  DryRunMessage,
  DryRunNextStep,
  DryRunStepState,
  WorkflowDescription,
  WorkflowDryRun,
} from 'waldur-js-client';

import {
  AlertItem,
  BaseButton,
  FormLabel,
  PropertyItem,
  PropertyList,
  Select,
  Tooltip,
} from 'waldur-ui';

import { FormattedHtml } from '@/core/FormattedHtml';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner, LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { STEP_MIN_WIDTH } from '@/proposals/proposal/WorkflowTimeline';
import { Call } from '@/proposals/types';
import { outcomeLabel } from '@/proposals/workflow/constants';
import { RoundScopedBadge } from '@/proposals/workflow/RoundScopedBadge';
import { groupByStage } from '@/proposals/workflow/stages';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { BooleanField } from '@/table/BooleanField';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';
import { renderFieldOrDash } from '@/table/utils';
import { ProgressStep, ProgressSteps, VerticalProgressSteps } from '@/wizard';
import { isStaff } from '@/workspace/selectors';

import { FixedHeightTabs } from '../FixedHeightTabs';
import { PanelHeaderControls } from '../PanelHeaderControls';
import { widthOfLongest } from '../selectWidth';
import { actorTitle } from '../summary';

import {
  actionsBeforeStep,
  actionsUpTo,
  coverageCounts,
  CoverageTotals,
  dryRunRequest,
  EMPTY_COVERAGE,
  mergeCoverage,
  stepDays,
  stepRowKey,
  stepRunLabel,
  stepStatusLabel,
  stepStatusVariant,
  untried,
  ViewAs,
} from './dryRun';
import { DryRunOutcomeDialog } from './DryRunOutcomeDialog';
import { DryRunPreview } from './DryRunPreview';
import { useWorkflowDryRun } from './queries';

/** The label column of what is waiting now, so the values line up. */
const FACT_LABEL_WIDTH = '140px';

const SaveScenarioDialog = lazyComponent(() =>
  import('../scenarios/SaveScenarioDialog').then((module) => ({
    default: module.SaveScenarioDialog,
  })),
);

const coverageSummary = (totals: CoverageTotals) => {
  const counts = coverageCounts(totals);
  return translate('Covered this session: {steps}, {outcomes}', {
    steps:
      counts.steps === 1
        ? translate('{exercised}/1 step', {
            exercised: counts.exercised,
          })
        : translate('{exercised}/{steps} steps', {
            exercised: counts.exercised,
            steps: counts.steps,
          }),
    outcomes:
      counts.outcomes === 1
        ? translate('{tried}/1 outcome', {
            tried: counts.outcomesTried,
          })
        : translate('{tried}/{outcomes} outcomes', {
            tried: counts.outcomesTried,
            outcomes: counts.outcomes,
          }),
  });
};

/** The paths not tried yet this visit, as a table: the tab is no taller
 * than History or Emails, so the block keeps one height. */
const CoverageTab: FC<{
  totals: CoverageTotals;
  names: Record<string, string>;
}> = ({ totals, names }) => {
  // A step and the outcome of it not chosen yet, a row each.
  const missing = useMemo(
    () =>
      Object.entries(totals.outcomes).flatMap(([key, value]) =>
        value.available
          .filter((outcome) => !value.tried.includes(outcome))
          .map((outcome) => ({
            id: `${key}:${outcome}`,
            step: names[key] ?? key,
            outcome: outcomeLabel(outcome),
          })),
      ),
    [totals, names],
  );
  const tableProps = useRowsTable('DryRunUntried', missing, missing);
  return (
    <div data-testid="dry-run-coverage">
      <Table<{ id: string; step: string; outcome: string }>
        {...tableProps}
        showPageSizeSelector
        columns={[
          {
            title: translate('Step'),
            ellipsis: false,
            render: ({ row }) => <>{row.step}</>,
          },
          {
            title: translate('Outcome not tried'),
            render: ({ row }) => <>{row.outcome}</>,
          },
        ]}
        verboseName={translate('Paths not tried')}
        rowKey="id"
        hideTitle
        hasActionBar={false}
        cardBordered={false}
        bodyClassName="p-0"
        placeholderHasRetry={false}
      />
    </div>
  );
};

const stepName = (step: DryRunStepState) =>
  [step.name, stepRunLabel(step)].filter(Boolean).join(' · ');

const StepName: FC<{ step: DryRunStepState }> = ({ step }) => (
  <span data-testid={`dry-run-step-${step.key}`}>
    {stepName(step)}
    {step.round_scoped && <RoundScopedBadge className="ms-1" />}
  </span>
);

/** The run's steps on the stepper a proposal's page shows its workflow
 * with (WorkflowTimeline): the submission, then a checkpoint per stage.
 * It only shows the run; Back moves it. */
const DryRunStepper: FC<{
  steps: DryRunStepState[];
  proposalState: string;
}> = ({ steps, proposalState }) => {
  const checkpoints = useMemo<ProgressStep[]>(() => {
    const done = (step: DryRunStepState) =>
      step.status !== 'pending' && step.status !== 'active';
    // A step's own line: its status, outcome and days. A stage lists one
    // per step, in the order of the names above, as the proposal's page
    // (WorkflowTimeline) does: each status stays with its step.
    const stepLine = (step: DryRunStepState) =>
      [
        stepStatusLabel(step, proposalState),
        step.outcome ? outcomeLabel(step.outcome) : null,
        stepDays(step) || null,
      ]
        .filter(Boolean)
        .join(' · ');
    return [
      {
        key: 'submission',
        label: translate('Submission'),
        completed: true,
        // The run starts here: there is nothing before it to go back to.
        description: [translate('Day {day}', { day: 0 })],
      },
      // Steps of one stage run at the same time: they share one
      // checkpoint, their names stacked, as on the proposal's page
      // (WorkflowTimeline).
      ...groupByStage(steps).map<ProgressStep>((group) => {
        const variants = group.map(stepStatusVariant);
        const variant =
          variants.find((v) => v === 'danger') ??
          variants.find((v) => v === 'warning');
        return {
          key: stepRowKey(group[0]),
          // Every name in sight, one per line, as the proposal's page
          // stacks a stage's steps: nothing hidden behind a count.
          label: (
            <div className="flex flex-col gap-1">
              {group.map((step) => (
                <StepName key={stepRowKey(step)} step={step} />
              ))}
            </div>
          ),
          description: group.map(stepLine),
          completed: group.every(done),
          variant,
        };
      }),
    ];
  }, [steps, proposalState]);
  return (
    // Not clickable, as a wizard's steps: Back moves the run back.
    <>
      {/* A tablet lays the steps in a row above the step, scrolling as the
          proposal's page does (WorkflowTimeline); wider screens and phones
          list them top to bottom. */}
      <div className="hidden md:max-lg:block overflow-x-auto py-1.5">
        <div style={{ minWidth: checkpoints.length * STEP_MIN_WIDTH }}>
          <ProgressSteps steps={checkpoints} bgClass="bg-primary" />
        </div>
      </div>
      <div className="md:max-lg:hidden">
        <VerticalProgressSteps steps={checkpoints} />
      </div>
    </>
  );
};

const RewindAction: FC<{ title: string; onRewind(): void }> = ({
  title,
  onRewind,
}) => (
  <ActionsDropdown>
    <ActionItem
      title={title}
      action={onRewind}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
    />
  </ActionsDropdown>
);

const LogTable: FC<{
  entries: DryRunLogEntry[];
  rewindOf(entry: DryRunLogEntry): (() => void) | undefined;
}> = ({ entries, rewindOf }) => {
  const tableProps = useRowsTable('DryRunLog', entries, entries);
  const columns: Column<DryRunLogEntry>[] = [
    {
      title: translate('Day'),
      render: ({ row }) => <>{row.day}</>,
    },
    {
      title: translate('Event'),
      ellipsis: false,
      render: ({ row }) => <>{row.text}</>,
    },
  ];
  return (
    <div data-testid="dry-run-log">
      <Table<DryRunLogEntry>
        {...tableProps}
        showPageSizeSelector
        columns={columns}
        verboseName={translate('Log')}
        rowKey="index"
        hideTitle
        hasActionBar={false}
        cardBordered={false}
        bodyClassName="p-0"
        placeholderHasRetry={false}
        rowActions={({ row }) => {
          const rewind = rewindOf(row);
          return rewind ? (
            <RewindAction
              title={translate('Rewind to here')}
              onRewind={rewind}
            />
          ) : null;
        }}
      />
    </div>
  );
};

/** A contribution of the step: whose work it is and where it stands. */
type Slot = DryRunStepState['contributions'][number];

/**
 * The step's contributions, one row each, with the work their holder can do
 * in the row's menu: what a real proposal's offering teams and reviewers do.
 */
const SlotWork: FC<{
  step: DryRunStepState;
  next: DryRunNextStep;
  onAct(action: DryRunActionRequest): void;
  /** The step is done: its contributions stay listed, with no work left. */
  finished?: boolean;
}> = ({ step, next, onAct, finished }) => {
  const { openDialog } = useModal();
  const tableProps = useRowsTable(
    `DryRunContributions-${step.key}`,
    step.contributions,
    [step.contributions, next],
  );
  if (
    finished
      ? !step.contributions.length
      : !next.open_slots.length && !next.can_reopen.length
  ) {
    return null;
  }
  const outcomes = next.contribution_outcomes;
  const submit = (slot: Slot) => {
    const act = (outcome?: string) =>
      onAct({
        step: next.step,
        contributions: [{ slot: slot.slot, ...(outcome ? { outcome } : {}) }],
      });
    if (!outcomes.length) {
      act();
      return;
    }
    openDialog(DryRunOutcomeDialog, {
      resolve: {
        title: translate('Submit work: {who}', { who: slot.label }),
        submitLabel: translate('Submit work'),
        outcomes,
        onSubmit: act,
      },
    });
  };
  const columns: Column<Slot>[] = [
    {
      title: translate('Contribution'),
      ellipsis: false,
      render: ({ row }) => <>{row.label}</>,
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <>
          {row.status}
          {row.outcome ? ` (${outcomeLabel(row.outcome)})` : ''}
          {row.delegated ? ` · ${translate('handed on')}` : ''}
        </>
      ),
    },
  ];
  return (
    <div>
      <Table<Slot>
        {...tableProps}
        columns={columns}
        verboseName={translate('Contributions')}
        rowKey="slot"
        // A handful of rows: the table is as tall as they are.
        minHeight="auto"
        bodyClassName="p-0"
        hideTitle
        hasActionBar={false}
        placeholderHasRetry={false}
        rowActions={({ row }) => {
          const open = !finished && next.open_slots.includes(row.slot);
          const reopen = !finished && next.can_reopen.includes(row.slot);
          if (!open && !reopen) return null;
          return (
            <ActionsDropdown>
              {open && (
                <ActionItem
                  title={translate('Submit work')}
                  action={() => submit(row)}
                  iconNode={<PaperPlaneTiltIcon weight="bold" />}
                />
              )}
              {open && next.can_delegate && (
                <ActionItem
                  title={translate('Hand on')}
                  action={() =>
                    onAct({ step: next.step, delegate: { slot: row.slot } })
                  }
                  iconNode={<ShareFatIcon weight="bold" />}
                />
              )}
              {reopen && (
                <ActionItem
                  title={translate('Reopen work')}
                  action={() =>
                    onAct({ step: next.step, reopen: { slot: row.slot } })
                  }
                  iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
                />
              )}
            </ActionsDropdown>
          );
        }}
      />
    </div>
  );
};

/**
 * The active step as a real proposal's page shows it to the call team
 * (WorkflowStepActions): a "Current step" panel per active step, its
 * outcome recorded through "Complete step", the rest beside it.
 */
const NextActions: FC<{
  data: WorkflowDryRun;
  onAct(action: DryRunActionRequest): void;
  /** The last decision is still being replayed. */
  busy?: boolean;
  /** The run's steps, beside the step to decide. */
  aside: ReactNode;
  /** A refusal of the last decision, above the step's buttons. */
  notice?: ReactNode;
  /** Undoes the last decision; none at the start of the run. */
  onBack?(): void;
  /** Finished steps the run can go back to, the latest first. */
  backTargets?: { value: string; label: string; go(): void }[];
  /** The emails the last decision (or the submission) would send. */
  lastMessages?: DryRunMessage[];
  /** Whether the run has had a decision yet. */
  decided?: boolean;
}> = ({
  data,
  onAct,
  busy,
  aside,
  notice,
  onBack,
  backTargets = [],
  lastMessages = [],
  decided,
}) => {
  // The button pressed spins while the run is replayed, as a submit
  // button does; the others wait, greyed out.
  const [pressed, setPressed] = useState<string>();
  const busyFor = (key: string) => ({
    pending: busy && pressed === key,
    disabled: busy,
    disabledReason: busy
      ? translate('Working out the last decision…')
      : undefined,
  });
  // Cleared once the replay ends, so a later refetch spins no button.
  useEffect(() => {
    if (!busy) setPressed(undefined);
  }, [busy]);
  const press = (key: string, action: DryRunActionRequest) => {
    setPressed(key);
    onAct(action);
  };
  const { openDialog } = useModal();
  const { next } = data;
  const byKey = useMemo(
    () => Object.fromEntries(data.steps.map((step) => [step.key, step])),
    [data.steps],
  );
  const global = [
    next.can_submit_changes && {
      label: translate('Applicant submits the changes'),
      action: { submit_changes: true },
    },
    next.can_advance && {
      label: translate('Move the proposal on'),
      action: { advance: true },
    },
    next.can_publish && {
      label: translate('Publish the round'),
      action: { publish: true },
      icon: <MegaphoneIcon weight="bold" />,
    },
    next.can_exhaust_budget && {
      label: translate('Take the budget as spent'),
      action: { exhaust_budget: true },
    },
    next.can_extend && {
      label: translate('Team asks for an extension'),
      action: { extend: true },
      icon: <ArrowClockwiseIcon weight="bold" />,
    },
    next.can_open_final_report && {
      label: translate('Open the final report'),
      action: { final_report: true },
      icon: <FileTextIcon weight="bold" />,
    },
  ].filter(Boolean) as {
    label: string;
    action: DryRunActionRequest;
    icon?: ReactNode;
  }[];
  // The step Back goes to: picked in the select beside it, the latest
  // finished step until another is picked.
  const [backTo, setBackTo] = useState<string>();
  const target =
    backTargets.find((option) => option.value === backTo) ?? backTargets[0];
  const backButton = (
    <BaseButton
      {...busyFor('Back')}
      variant="tertiary"
      // 44px, as the wizard footer's Back (WizardButtons) and the select
      // beside it.
      size="lg"
      label={translate('Back')}
      iconNode={<CaretLeftIcon weight="bold" />}
      disabled={busy || !onBack}
      disabledReason={
        !onBack
          ? translate('You are on the first step')
          : busy
            ? translate('Working out the last decision…')
            : undefined
      }
      onClick={() => {
        setPressed('Back');
        if (target) {
          target.go();
        } else {
          onBack?.();
        }
        setBackTo(undefined);
      }}
    />
  );
  const globalButtons = global.map(({ label, action, icon }) => (
    <BaseButton
      {...busyFor(label)}
      key={label}
      variant="primary"
      // The icon each action has where it is done for real (round,
      // post-award pages); moving the proposal on is Advance workflow's.
      iconNode={icon ?? <ArrowRightIcon weight="bold" />}
      label={label}
      onClick={() => press(label, action)}
    />
  ));
  const statusOf = (key: string) =>
    byKey[key]
      ? [
          stepStatusLabel(byKey[key], data.proposal_state),
          byKey[key].outcome ? outcomeLabel(byKey[key].outcome) : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;
  // What is waiting now, as key/value rows. A step in a tab of its own
  // leaves its name to the tab and says how it stands, so a finished tab
  // keeps the rows a running one has.
  const factsOf = (step: DryRunNextStep, inTab: boolean) => (
    <PropertyList variant="summary" termWidth={FACT_LABEL_WIDTH}>
      {inTab ? (
        <PropertyItem label={translate('Status')} value={statusOf(step.step)} />
      ) : (
        <PropertyItem label={translate('Step')} value={step.name} />
      )}
      <PropertyItem label={translate('Day')} value={String(data.day)} />
      <PropertyItem
        label={translate('Due on day')}
        value={
          byKey[step.step]?.deadline_day != null
            ? String(byKey[step.step].deadline_day)
            : null
        }
      />
    </PropertyList>
  );
  const stepButtons = (step: DryRunNextStep, doneReason?: string) => {
    // Each step's own buttons spin on their own; a finished step's stay in
    // place, disabled, saying why.
    const key = (label: string) => `${step.step}:${label}`;
    const state = (label: string) =>
      doneReason
        ? { pending: false, disabled: true, disabledReason: doneReason }
        : busyFor(key(label));
    return (
      <>
        {step.can_reject && (
          <BaseButton
            {...state('Reject')}
            variant="danger"
            iconNode={<XCircleIcon weight="bold" />}
            label={translate('Reject')}
            onClick={() =>
              press(key('Reject'), { step: step.step, reject: true })
            }
          />
        )}
        {step.can_expire && (
          <BaseButton
            {...state('Let it lapse')}
            variant="tertiary"
            iconNode={<ClockCounterClockwiseIcon weight="bold" />}
            label={translate('Let it lapse')}
            onClick={() =>
              press(key('Let it lapse'), { step: step.step, expire: true })
            }
          />
        )}
        {step.can_request_changes && (
          <BaseButton
            {...state('Request changes')}
            variant="tertiary"
            iconNode={<NotePencilIcon weight="bold" />}
            label={translate('Request changes')}
            onClick={() =>
              press(key('Request changes'), {
                step: step.step,
                request_changes: true,
              })
            }
          />
        )}
        {step.can_cancel_changes && (
          <BaseButton
            {...state('Cancel request for changes')}
            variant="tertiary"
            iconNode={<XCircleIcon weight="bold" />}
            label={translate('Cancel request for changes')}
            onClick={() =>
              press(key('Cancel request for changes'), {
                step: step.step,
                cancel_changes: true,
              })
            }
          />
        )}
        {step.can_release && (
          <BaseButton
            {...state('Release the report')}
            variant="primary"
            label={translate('Release the report')}
            // As the proposal page's own Release to applicant.
            iconNode={<ShareFatIcon weight="bold" />}
            onClick={() =>
              press(key('Release the report'), {
                step: step.step,
                release: true,
              })
            }
          />
        )}
        {step.outcomes.length > 0 && (
          <BaseButton
            {...state('Complete step')}
            variant="primary"
            iconNode={<CheckCircleIcon weight="bold" />}
            label={translate('Complete step')}
            onClick={() =>
              openDialog(DryRunOutcomeDialog, {
                resolve: {
                  title: translate('Complete step: {name}', {
                    name: step.name,
                  }),
                  submitLabel: translate('Complete step'),
                  outcomes: step.outcomes,
                  onSubmit: (outcome: string) =>
                    press(
                      key('Complete step'),
                      step.round_step
                        ? { step: step.step, outcome, round_step: true }
                        : { step: step.step, outcome },
                    ),
                },
              })
            }
          />
        )}
      </>
    );
  };
  // Each step as it last ran in this run: a finished step's tab keeps its
  // buttons. A rewind starts the record over.
  const lastRun = useRef<Record<string, DryRunNextStep>>({});
  const seen = { ...lastRun.current };
  Object.keys(seen).forEach((key) => {
    if (!byKey[key] || byKey[key].started_day == null) delete seen[key];
  });
  next.steps.forEach((step) => {
    seen[step.step] = step;
  });
  useEffect(() => {
    lastRun.current = seen;
  });
  // A finished step this session never saw running: its buttons from the
  // run's own state, so its tab is never empty.
  const asFinished = (step: DryRunStepState): DryRunNextStep =>
    seen[step.key] ?? {
      step: step.key,
      name: step.name,
      outcomes: step.outcomes,
      contribution_outcomes: step.contribution_outcomes,
      open_slots: [],
      can_reopen: [],
      can_reject: false,
      can_expire: false,
      can_request_changes: false,
      can_cancel_changes: false,
      can_delegate: false,
      can_release: false,
      round_step: step.round_scoped,
    };
  // The stage the run stands in: every step of the first running step's
  // stage that has started, the finished ones too.
  const stageKey = next.steps[0] ? byKey[next.steps[0].step]?.stage : undefined;
  const stage = next.steps.length
    ? stageKey === undefined
      ? next.steps.map((step) => byKey[step.step]).filter(Boolean)
      : data.steps.filter(
          (step) => step.stage === stageKey && step.started_day != null,
        )
    : [];
  // One step's facts, buttons and contributions.
  const stepSection = (
    step: DryRunNextStep,
    index: number,
    doneReason?: string,
  ) => (
    <div
      className="flex flex-col gap-4"
      data-testid={`dry-run-next-${step.step}`}
    >
      <div className="flex flex-col gap-3">
        <div
          tabIndex={-1}
          data-dry-run-focus={index >= 0 || undefined}
          data-testid={index === 0 ? 'dry-run-now' : undefined}
        >
          {factsOf(step, stage.length > 1)}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {/* The proposal's own moves (the applicant's changes, the round)
              belong to the step it waits at. */}
          {index === 0 && !doneReason && globalButtons}
          {stepButtons(step, doneReason)}
        </div>
      </div>
      {byKey[step.step] && (
        <SlotWork
          step={byKey[step.step]}
          next={step}
          onAct={onAct}
          finished={Boolean(doneReason)}
        />
      )}
    </div>
  );
  // The steps and the one to decide now, in one block: the stepper is where
  // the step sits in the workflow.
  return (
    <Panel
      cardBordered
      className="mb-0"
      title={translate('Workflow progress')}
      // A panel inside the Dry run panel: a smaller title, as nested
      // panels have (RestrictionsInfoCard, FormNetworkSecurityStep).
      titleClassName="text-sm"
      subtitle={translate(
        'The steps of the workflow, and the one waiting for your decision.',
      )}
      subtitleClassName="font-normal"
    >
      {/* While the run is replayed: dimmed, with the spinner in the
          middle, as a table shows a refetch (TableContent). */}
      <div className="relative">
        {busy && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <h1 className="mb-0">
              <LoadingSpinnerSimple />
            </h1>
          </div>
        )}
        <div
          aria-busy={busy || undefined}
          className="flex flex-col lg:flex-row gap-5.5 transition-opacity duration-150 aria-busy:pointer-events-none aria-busy:opacity-50"
        >
          {/* A divider, as the panel's header has: the workflow on the left,
            the step's own work on the right. */}
          <div className="shrink-0 border-b border-b-secondary pb-4 lg:w-[300px] lg:border-b-0 lg:border-r lg:border-r-secondary lg:pb-0 lg:pr-7">
            {/* The stepper's rows open with space above each name; the
                first starts level with the step's details beside it. */}
            <div className="-mt-4 md:max-lg:mt-0">{aside}</div>
          </div>
          <div
            // The column runs the stepper's height; Back keeps to its foot
            // however much the step shows.
            className="grow min-w-0 flex flex-col gap-4"
          >
            {/* Every step waiting now, steps the workflow runs together one
                under the other: what is waiting, then what can be done. */}
            {stage.length === 1 && stepSection(next.steps[0], 0)}
            {/* Steps the workflow runs at the same time: a tab each, as
                parallel views are, the block as tall as its tallest tab.
                A step finished first keeps its tab, with its outcome, until
                the whole stage is done: nothing moves under the user. */}
            {stage.length > 1 && (
              <div>
                <FixedHeightTabs
                  // A new stage opens on its first tab.
                  key={stage.map((member) => member.key).join()}
                  items={stage.map((member) => {
                    const running = next.steps.find(
                      (step) => step.step === member.key,
                    );
                    return {
                      value: member.key,
                      title: member.name,
                      content: running
                        ? stepSection(running, next.steps.indexOf(running))
                        : stepSection(
                            asFinished(member),
                            -1,
                            translate('This step is finished.'),
                          ),
                    };
                  })}
                />
              </div>
            )}
            {/* A step of another stage waiting too (a finished step's
                report to release): its own section below. */}
            {stageKey !== undefined &&
              next.steps
                .filter((step) => byKey[step.step]?.stage !== stageKey)
                .map((step) => (
                  <Fragment key={step.step}>
                    {stepSection(step, next.steps.indexOf(step))}
                  </Fragment>
                ))}
            {!next.steps.length && (
              <div className="flex flex-col gap-3">
                <div tabIndex={-1} data-dry-run-focus data-testid="dry-run-now">
                  <PropertyList variant="summary" termWidth={FACT_LABEL_WIDTH}>
                    <PropertyItem
                      label={translate('Proposal')}
                      value={data.proposal_state.replace(/_/g, ' ')}
                    />
                    <PropertyItem
                      label={translate('Day')}
                      value={String(data.day)}
                    />
                  </PropertyList>
                </div>
                {global.length > 0 && (
                  <div className="flex flex-wrap gap-2.5">{globalButtons}</div>
                )}
              </div>
            )}
            {notice}
            {!next.steps.length && !global.length && (
              <p className="text-quaternary mb-0">
                {translate(
                  'Nothing is left to decide. Go back to try another path.',
                )}
              </p>
            )}
            {/* What the last move sent, next to the move: the Emails tab
                below keeps the whole run's. */}
            {lastMessages.length > 0 && (
              <div>
                <p className="text-quaternary mb-1.5">
                  {lastMessages.length === 1
                    ? decided
                      ? translate('Your last decision triggers 1 email.')
                      : translate('The submission triggers 1 email.')
                    : decided
                      ? translate(
                          'Your last decision triggers {count} emails.',
                          { count: lastMessages.length },
                        )
                      : translate('The submission triggers {count} emails.', {
                          count: lastMessages.length,
                        })}
                </p>
                <MessagesTable messages={lastMessages} compact />
              </div>
            )}
            {/* The wizard's footer (OrganizationCreatePage): Back, at the
              bottom of the step's own column. */}
            <div className="flex flex-wrap items-center gap-2.5 mt-auto pt-4 border-t border-t-secondary">
              {backButton}
              {/* Which step Back goes to; Back confirms it. */}
              {backTargets.length > 0 && (
                <div style={{ width: widthOfLongest(backTargets) }}>
                  <Select
                    aria-label={translate('Step to go back to')}
                    // At the foot of the block: the list opens upwards.
                    menuPlacement="top"
                    options={backTargets}
                    value={target}
                    onChange={(option: any) => setBackTo(option?.value)}
                    isClearable={false}
                    isSearchable={false}
                    isDisabled={busy}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};

const audienceText = (message: DryRunMessage) =>
  message.audience.count === 1
    ? translate('{audience}, 1 person', { audience: message.audience.label })
    : translate('{audience}, {count} people', {
        audience: message.audience.label,
        count: message.audience.count,
      });

const MessagesTable: FC<{
  messages: DryRunMessage[];
  /** The few emails of the last decision, beside it: a bordered table as
   * tall as its rows, as the step's contributions table. */
  compact?: boolean;
}> = ({ messages, compact }) => {
  const tableProps = useRowsTable(
    compact ? 'DryRunLastMessages' : 'DryRunMessages',
    messages,
    messages,
  );
  const columns: Column<DryRunMessage>[] = [
    {
      // One line, as table cells are: the full text is in the expanded row.
      title: translate('Subject'),
      width: '53%',
      render: ({ row }) => (
        // Cut to one line; the full subject in the library's tooltip.
        <Tooltip label={row.subject}>
          <span
            className="block truncate text-primary"
            data-testid="dry-run-message"
          >
            {row.subject}
          </span>
        </Tooltip>
      ),
    },
    {
      title: translate('Day'),
      width: '10%',
      render: ({ row }) => <>{row.day}</>,
    },
    {
      title: translate('Audience'),
      width: '25%',
      render: ({ row }) => (
        <Tooltip label={audienceText(row)}>
          <span className="block truncate">{audienceText(row)}</span>
        </Tooltip>
      ),
    },
    {
      // Whether the portal's notification settings let it go out.
      title: translate('Sent'),
      width: '12%',
      render: ({ row }) => <BooleanField value={row.enabled} />,
    },
    // Beside the step, in a narrow column: the step goes without saying.
    ...(compact
      ? []
      : [
          {
            title: translate('Step'),
            render: ({ row }: { row: DryRunMessage }) =>
              renderFieldOrDash(row.step_name),
          },
        ]),
  ];
  return (
    <Table<DryRunMessage>
      {...tableProps}
      showPageSizeSelector={!compact}
      columns={columns}
      verboseName={translate('Messages')}
      rowKey="index"
      hideTitle
      hasActionBar={false}
      cardBordered={compact}
      minHeight={compact ? 'auto' : undefined}
      // Fixed columns in the narrow column: long text ends in … with the
      // full text on hover, rather than the table scrolling sideways.
      className={classNames(
        // The expanded email keeps to the width the table shows, as the
        // Notifications tab's expanded rows do (container query width).
        '[&_.table-responsive]:[container-type:inline-size]',
        compact && '[&_table]:table-fixed',
      )}
      // All on one page: no pager unless they run past it.
      hasPagination={!compact || messages.length > 10}
      bodyClassName="p-0"
      placeholderHasRetry={false}
      expandableRow={({ row }) => (
        <ExpandableContainer className="fluid">
          {/* Wraps to the width the table shows; see FindingDetails. */}
          <div className="sticky left-0 w-[calc(100cqw-64px)]">
            {/* Read-only, as the mail dialog's preview: the email as its
                recipients see it, without a Text tab to choose. */}
            <div data-testid="mail-view">
              <FormattedHtml html={row.html} />
            </div>
          </div>
        </ExpandableContainer>
      )}
    />
  );
};

/**
 * Trying the call's workflow on a synthetic proposal: pick outcomes, let
 * steps lapse, ask for changes, rewind to any point, and read every mail
 * the path would send. Each click replays the whole path on the server;
 * nothing is sent and nothing kept.
 */
export const DryRunPanel: FC<{
  call: Call;
  description: WorkflowDescription;
  /** Leave the steps switched off out of the step list. */
  hideDisabled?: boolean;
}> = ({ call, description, hideDisabled }) => {
  const disabledKeys = useMemo(
    () =>
      new Set(
        description.steps
          .filter((step) => !step.enabled)
          .map((step) => step.key),
      ),
    [description],
  );
  const [actions, setActions] = useState<DryRunActionRequest[]>([]);
  const [offerings, setOfferings] = useState<string[] | null>(null);
  const [viewAs, setViewAs] = useState<ViewAs | null>(null);
  const [totals, setTotals] = useState<CoverageTotals>(EMPTY_COVERAGE);
  const [shown, setShown] = useState<WorkflowDryRun>();
  // How many decisions the shown run holds: until the next run arrives,
  // the last decision's emails stay those of the run on screen.
  const [shownDecisions, setShownDecisions] = useState(0);
  const staff = useSelector(isStaff);
  const { openDialog } = useModal();
  const ids = useId();
  const nextRef = useRef<HTMLDivElement>(null);
  // An action taken from the next-step card: once its run is shown, focus
  // goes to what comes next instead of dropping to the page.
  const acted = useRef(false);

  const request = useMemo(
    () => dryRunRequest(actions, offerings, viewAs),
    [actions, offerings, viewAs],
  );
  const { data, error, isFetching } = useWorkflowDryRun(call.uuid, request);

  useEffect(() => {
    if (!data) return;
    setShown(data);
    setShownDecisions(actions.length);
    setTotals((current) => mergeCoverage(current, data.coverage));
  }, [data]);

  useEffect(() => {
    // Only once the new run is the one on screen: `shown` catches up with
    // `data` a render later, and focusing before would land on what is
    // about to be replaced.
    if (!acted.current || !shown || isFetching || shown !== data) return;
    acted.current = false;
    // The first waiting step in sight: in a stage's tabs, the open tab's.
    const targets = Array.from(
      nextRef.current?.querySelectorAll<HTMLElement>('[data-dry-run-focus]') ??
        [],
    );
    (
      targets.find((element) => !element.closest('[aria-hidden="true"]')) ??
      targets[0]
    )?.focus();
  }, [shown, isFetching]);

  const names = useMemo(
    () =>
      Object.fromEntries(
        description.steps.map((step) => [step.key, step.name || step.key]),
      ),
    [description],
  );
  const offeringOptions = useMemo(
    () =>
      (call.offerings ?? [])
        .filter((offering) => offering.state === 'accepted')
        .map((offering) => ({
          value: offering.uuid,
          label: offering.offering_name,
        })),
    [call.offerings],
  );
  const roleOptions = useMemo(
    () => [
      { value: null, label: translate('Nobody: no preview') },
      ...description.actors
        .filter((actor) => actor.key !== 'system')
        .map((actor) => ({ value: actor.key, label: actorTitle(actor) })),
    ],
    [description],
  );
  const act = (action: DryRunActionRequest) => {
    acted.current = true;
    setActions([...actions, action]);
  };
  const current = shown;
  const chosenOfferings = current
    ? current.requested_offerings.map((o) => o.uuid)
    : [];
  const pointLabel = useMemo(() => {
    const entries = (current?.log ?? []).filter(
      (entry) => entry.kind !== 'notification',
    );
    return entries.length
      ? entries[entries.length - 1].text
      : translate('the submission');
  }, [current]);

  const lastEntry = useMemo(() => {
    const entries = (current?.log ?? []).filter(
      (entry) => entry.kind !== 'notification',
    );
    return actions.length && entries.length
      ? entries[entries.length - 1].text
      : '';
  }, [current, actions.length]);

  return (
    <div data-testid="dry-run" className="flex flex-col gap-5">
      <PanelHeaderControls>
        {/* Always in place, so the header never shifts as the run starts. */}
        <BaseButton
          variant="tertiary"
          size="lg"
          label={translate('Start over')}
          iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
          disabled={!actions.length}
          disabledReason={
            actions.length
              ? undefined
              : translate('Nothing to undo yet: make a decision first.')
          }
          onClick={() => setActions([])}
        />
        <BaseButton
          variant="tertiary"
          size="lg"
          label={translate('Save as scenario')}
          iconNode={<BookmarkSimpleIcon weight="bold" />}
          disabled={!current?.scenario_draft || !actions.length}
          disabledReason={
            current?.scenario_draft && actions.length
              ? undefined
              : translate('Make a decision first: a scenario is a path.')
          }
          onClick={() =>
            openDialog(SaveScenarioDialog, {
              resolve: {
                draft: current.scenario_draft,
                // Templates are staff's to change; others export it.
                templateUuid: staff ? call.template_uuid : null,
                templateName: call.template_name,
              },
              size: 'lg',
            })
          }
        />
      </PanelHeaderControls>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="min-w-[280px]">
          <FormLabel className="text-xs" htmlFor={`${ids}-offerings`}>
            {translate('Requested offerings')}
          </FormLabel>
          <Select
            inputId={`${ids}-offerings`}
            aria-label={translate('Requested offerings')}
            isMulti
            options={offeringOptions}
            value={offeringOptions.filter((option) =>
              chosenOfferings.includes(option.value),
            )}
            onChange={(options: any) => {
              setOfferings((options ?? []).map((option) => option.value));
              setActions([]);
            }}
          />
        </div>
        <div className="min-w-[240px]">
          <FormLabel className="text-xs" htmlFor={`${ids}-view-as`}>
            {translate('View as')}
          </FormLabel>
          <Select
            inputId={`${ids}-view-as`}
            aria-label={translate('View as')}
            options={roleOptions}
            value={roleOptions.find(
              (option) => option.value === (viewAs?.role ?? null),
            )}
            onChange={(option: any) =>
              setViewAs(option?.value ? { role: option.value } : null)
            }
            isClearable={false}
            isSearchable={false}
          />
        </div>
        {viewAs?.role === 'offering_team' && current && (
          <div className="min-w-[200px]">
            <FormLabel className="text-xs" htmlFor={`${ids}-offering`}>
              {translate('Offering')}
            </FormLabel>
            <Select
              inputId={`${ids}-offering`}
              aria-label={translate('Offering')}
              options={current.requested_offerings.map((o) => ({
                value: o.index,
                label: o.name,
              }))}
              value={current.requested_offerings
                .map((o) => ({ value: o.index, label: o.name }))
                .find((option) => option.value === (viewAs.offering ?? 0))}
              onChange={(option: any) =>
                setViewAs({ ...viewAs, offering: option.value })
              }
              isClearable={false}
              isSearchable={false}
            />
          </div>
        )}
      </div>
      {!current ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* What the last action did, said once: the log below is
              replayed whole on every run. */}
          <div role="status" className="sr-only">
            {lastEntry}
          </div>
          <div ref={nextRef}>
            <NextActions
              data={current}
              onAct={act}
              busy={isFetching}
              decided={shownDecisions > 0}
              lastMessages={current.messages.filter(
                (message) =>
                  message.action ===
                  (shownDecisions ? shownDecisions - 1 : null),
              )}
              backTargets={current.steps
                .filter(
                  (step) =>
                    step.status !== 'pending' && step.status !== 'active',
                )
                .map((step) => {
                  const before = actionsBeforeStep(
                    actions,
                    current.log,
                    step.key,
                  );
                  return before && before.length < actions.length
                    ? {
                        value: stepRowKey(step),
                        label: stepName(step),
                        go: () => setActions(before),
                      }
                    : null;
                })
                .filter(Boolean)
                .reverse()}
              onBack={
                actions.length
                  ? () => setActions(actions.slice(0, -1))
                  : undefined
              }
              aside={
                <DryRunStepper
                  steps={current.steps.filter(
                    (step) => !(hideDisabled && disabledKeys.has(step.key)),
                  )}
                  proposalState={current.proposal_state}
                />
              }
              notice={
                error && (
                  <AlertItem
                    variant="error"
                    type="floating"
                    className="mb-3"
                    title={error.detail}
                    body={
                      error.status === 429
                        ? translate('Wait a moment, then try again.')
                        : undefined
                    }
                    actions={
                      actions.length ? (
                        <BaseButton
                          variant="secondary"
                          size="sm"
                          label={translate('Undo the last action')}
                          onClick={() => setActions(actions.slice(0, -1))}
                        />
                      ) : undefined
                    }
                  />
                )
              }
            />
          </div>
          <Panel
            cardBordered
            className="mb-0"
            title={translate('What happened')}
            // 8px less above the tabs than the panel's usual 16px.
            bodyClassName="pt-[8px]"
            // A panel inside the Dry run panel: a smaller title, as nested
            // panels have (RestrictionsInfoCard, FormNetworkSecurityStep).
            titleClassName="text-sm"
            subtitle={coverageSummary(totals)}
            subtitleClassName="font-normal"
            actions={
              <BaseButton
                variant="tertiary"
                size="lg"
                label={translate('Reset coverage')}
                tooltip={translate(
                  'Coverage counts the steps reached and the outcomes chosen across every dry run of this visit, so you can see which paths of the workflow are still untried. Resetting starts the count again from zero; it changes nothing on the call.',
                )}
                onClick={() => setTotals(EMPTY_COVERAGE)}
              />
            }
          >
            <FixedHeightTabs
              listClassName="mb-1"
              items={[
                {
                  value: 'log',
                  title: translate('History'),
                  content: (
                    <LogTable
                      entries={current.log.filter(
                        (entry) => entry.kind !== 'notification',
                      )}
                      rewindOf={(entry) =>
                        actionsUpTo(actions, entry).length < actions.length
                          ? () => setActions(actionsUpTo(actions, entry))
                          : undefined
                      }
                    />
                  ),
                },
                {
                  value: 'messages',
                  title: translate('Emails'),
                  count: current.messages.length,
                  content: <MessagesTable messages={current.messages} />,
                },
                {
                  value: 'coverage',
                  title: translate('Coverage'),
                  count: untried(totals, names).length,
                  content: <CoverageTab totals={totals} names={names} />,
                },
              ]}
            />
          </Panel>
          {current.view_as && (
            <DryRunPreview
              view={current.view_as}
              roleLabel={`${current.view_as.viewer.full_name} (${current.view_as.described_as})`}
              pointLabel={pointLabel}
            />
          )}
        </>
      )}
    </div>
  );
};
