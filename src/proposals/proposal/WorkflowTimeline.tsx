import { XIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  EvaluationStartEnum,
  ProposalWorkflowStepInstance,
} from 'waldur-js-client';

import { formatDate, formatDateTime, formatRelative } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import {
  usesCallVocabulary,
  showsWorkflowSteps,
} from '@/proposals/presentation';
import { ProgressStep, ProgressSteps } from '@/wizard';
import { useUser } from '@/workspace/hooks';

import { heldDecisionLabel } from '../roundLifecycle';
import { isOnProposalTeam } from '../team/teamRules';
import { Proposal } from '../types';
import {
  isAllocationDecisionStep,
  isAwardResponseStep,
  outcomeLabel,
  responsibleRoleLabel,
  statusLabel,
} from '../workflow/constants';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';
import {
  activeStepsOf,
  groupByStage,
  isConditionSkipped,
} from '../workflow/stages';

import { getApplicantTimeline } from './applicantTimeline';
import { useOfferingAssessments } from './contributions/queries';
import {
  CurrentStepNote,
  ProgressSteps as ProposalStateSteps,
} from './create/ProgressSteps';
import { getStepOfferingResults } from './offeringResults';
import { runPhaseLabel } from './postAward';
import { WorkflowStepDetail, WorkflowStepLabel } from './WorkflowStepLabel';

/** Narrowest a checkpoint column gets before the stepper scrolls instead. */
export const STEP_MIN_WIDTH = 120;

interface WorkflowTimelineProps {
  proposal: Proposal;
  /** Show a short status line beneath every checkpoint, and the call
   *  team's full detail (owner, dates, outcome) in each step's popover.
   *  Call-manager view turns this on; the applicant view keeps the tracker
   *  clean with step labels only. */
  showDetails?: boolean;
  /** The call's `evaluation_start`. On an `at_cutoff` call a submitted
   *  proposal waits for its round to close before any step starts. */
  evaluationStart?: EvaluationStartEnum;
}

export const WorkflowTimeline: FC<WorkflowTimelineProps> = ({
  proposal,
  showDetails = false,
  evaluationStart,
}) => {
  const awaitingManualAdvance = proposal.awaiting_manual_advance ?? false;

  const { data, isLoading, isError } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
  });

  const visibleStates = useMemo<ProposalWorkflowStepInstance[]>(() => {
    // A step skipped because its run condition did not hold stays on the
    // tracker as not needed: the proposal passed it. One the call disabled
    // never was on the proposal's path.
    const live = (data ?? []).filter(
      (s) => s.status !== 'skipped' || isConditionSkipped(s),
    );
    // The call team sees the whole process. For everyone else the step
    // catalog is internal: `applicant_visible` is the call manager's own
    // decision about which steps they expose, and it was never honoured here
    // — every non-skipped step was named regardless, on every deployment.
    // Where the deployment hides step detail entirely, none survive and the
    // coarse tracker below takes over.
    if (showDetails) return live;
    if (!showsWorkflowSteps()) return [];
    // The call team reading the applicant's view gets their own payload, in
    // which a held decision is already recorded. The applicant's shows that
    // step still under way, so the view is rebuilt from that: otherwise the
    // tracker would skip past the decision and present the next step as
    // current.
    const asApplicantSees = proposal.decision_held
      ? live.map((s) =>
          isAllocationDecisionStep(s)
            ? {
                ...s,
                // What the backend strips from the applicant's payload.
                status: 'active' as const,
                outcome: null,
                outcome_reason: '',
                rejection_reason: null,
                completed_at: null,
                completed_by: null,
              }
            : s,
        )
      : live;
    return getApplicantTimeline(asApplicantSees);
  }, [data, showDetails, proposal.decision_held]);

  // The step where the workflow stopped advancing — the proposal's failure
  // point. Everything after it is unreachable and rendered struck-through, so
  // the timeline reflects the terminal state rather than implying it's still
  // in flight. A step-level rejection (rejection_reason) is the explicit
  // signal; a proposal rejected without one (e.g. a high-level reject) fails
  // at the first step that never completed.
  const failureIndex = useMemo(() => {
    const rejected = visibleStates.findIndex(
      (s) => s.rejection_reason !== null,
    );
    if (rejected !== -1) return rejected;
    if (proposal.state === 'rejected') {
      return visibleStates.findIndex(
        (s) => s.status !== 'completed' && !isConditionSkipped(s),
      );
    }
    return -1;
  }, [visibleStates, proposal.state]);
  // The step that ended a rejected proposal, which the steps after it name.
  const failedStep =
    proposal.state === 'rejected' && failureIndex !== -1
      ? visibleStates[failureIndex]
      : undefined;

  // What the applicant actually wants from a tracker: whether it is their
  // turn, and when to expect news. Both are already in the payload, but the
  // per-step deadlines below are `showDetails`-only, so without this an
  // applicant on a call that does expose its steps would see no date at all.
  //
  // The applicant's line and no one else's: it is written in the second
  // person, and the call team has the full per-step detail under every
  // checkpoint. Handing it to them too would address them as the applicant
  // and paint their tracker amber for a step that is not waiting on them.
  // A reviewer reads this same view without `showDetails`, so being off the
  // call team is not enough: only the applicant team -- whoever applies with
  // the proposal, not its creator alone -- gets the line, and everyone else
  // sees the plain step labels.
  const user = useUser();
  const isApplicant = isOnProposalTeam(user, proposal);
  // With several steps of a stage running, the first speaks for them.
  const active = activeStepsOf(data)[0];
  // A call that evaluates at the round cut-off holds every submitted proposal,
  // with no step started, until the round closes. Without saying so the
  // tracker would mark its first step as current and read as review under way.
  const awaitingCutoff =
    evaluationStart === 'at_cutoff' &&
    proposal.state === 'submitted' &&
    !active;
  // Why a rejected request stopped, as the step that stopped it recorded it.
  // Only a step the call shows the applicant may say so: a hidden step's
  // reason is the call team's own note. The per-step tracker shows it in that
  // step's popover; the coarse one has no such step, so it goes on the line.
  const rejectionReason = useMemo(() => {
    if (proposal.state !== 'rejected') return undefined;
    const decided = (data ?? []).filter(
      (s) =>
        s.applicant_visible &&
        s.status === 'completed' &&
        (s.rejection_reason || s.outcome_reason),
    );
    const last = decided[decided.length - 1];
    return last ? last.rejection_reason || last.outcome_reason : undefined;
  }, [data, proposal.state]);
  const statusLine = useMemo<CurrentStepNote | undefined>(() => {
    if (showDetails || !isApplicant) return undefined;
    if (rejectionReason) {
      return {
        text: translate('Reason: {reason}', { reason: rejectionReason }),
      };
    }
    if (awaitingCutoff) {
      return {
        text: translate(
          'Submitted — evaluation starts after the round cut-off.',
        ),
      };
    }
    if (!active) return undefined;
    if (isAwardResponseStep(active)) {
      // Not a status report: the step is stalled on the applicant, which is
      // what the design system's Status=Warning step is for — the same flag
      // OrderInProgressView raises on a step held up on the user. The sentence
      // already names the ask, so it carries no badge on top of it.
      return {
        variant: 'warning',
        text: translate(
          'Your confirmation is needed before resources are set up.',
        ),
      };
    }
    // A step the applicant completes (the final report, an extension
    // request) waits on them, not on a decision.
    if (active.completer === 'applicant') {
      return {
        variant: 'warning',
        text: active.deadline
          ? translate('Your response is due by {date}.', {
              date: formatDate(active.deadline),
            })
          : translate('Your response is needed.'),
      };
    }
    if (active.deadline) {
      return {
        text: translate('Decision expected by {date}.', {
          date: formatDate(active.deadline),
        }),
      };
    }
    // `deadline` is computed from started_at plus the step's own
    // duration_in_days, so a call that sets no per-step duration — the default
    // — never has one, and the line above would render nothing at all. Say
    // what is happening instead: knowing the request is moving is most of what
    // the line was added to convey, and the date is the bonus when set.
    return {
      text: usesCallVocabulary()
        ? translate('Your proposal is being reviewed.')
        : translate('Your request is being reviewed.'),
    };
  }, [active, showDetails, isApplicant, awaitingCutoff, rejectionReason]);

  // A decision held for the round's publication: recorded on the allocation
  // decision step, but nothing after it happens until the round publishes.
  // Only the call team is told (decision_held is null for everyone else, and
  // their payload shows the step still active).
  // The applicant's view never shows the hold, even to the call team.
  const heldIndex = useMemo(
    () =>
      showDetails && proposal.decision_held
        ? visibleStates.findIndex(isAllocationDecisionStep)
        : -1,
    [showDetails, proposal.decision_held, visibleStates],
  );

  // A step split per requested offering concludes per offering: the
  // aggregate word ("Infeasible" once any is rejected) reads as the
  // proposal having failed, while the accepted offerings go on. The call
  // team already reads the per-offering assessments; they say it better.
  const { data: assessments } = useOfferingAssessments(
    proposal.uuid,
    showDetails,
  );
  const offeringResults = useMemo(
    () => (showDetails ? getStepOfferingResults(assessments) : {}),
    [assessments, showDetails],
  );

  // Which checkpoint's popover is open. One at a time: the stepper icon
  // opens the same popover as the name, so the state lives here.
  const [openKey, setOpenKey] = useState<string | null>(null);

  const steps = useMemo<ProgressStep[]>(() => {
    // Under each checkpoint: its name and one short line. Everything else —
    // what the step is for, who completes it, the dates, the outcome and its
    // reason — is in the popover the name opens. A dozen narrow columns each
    // carrying a paragraph and a three-part status read as one tall wall of
    // text running into its neighbours.
    const perOffering = (s: ProposalWorkflowStepInstance) =>
      s.per_requested_offering ? offeringResults[s.call_step_uuid] : undefined;

    const shortStatus = (s: ProposalWorkflowStepInstance) => {
      const parts = [statusLabel(s.status)];
      const results = perOffering(s);
      if (results?.summary && s.status !== 'pending') {
        parts.push(results.summary);
      } else if (s.status === 'completed' && s.outcome) {
        parts.push(outcomeLabel(s.outcome));
        if (s.decided_automatically) {
          parts.push(translate('automatically'));
        }
      } else if (s.status === 'active' && s.waiting_for) {
        parts.push(translate('needs attention'));
      } else if (s.status === 'active' && s.awaiting_lead) {
        parts.push(translate('waiting for a lead'));
      } else if (s.status === 'active' && s.deadline) {
        parts.push(
          translate('due {date}', { date: formatRelative(s.deadline) }),
        );
      }
      return parts.join(' · ');
    };

    // Only what this viewer's payload already carries: the applicant's has
    // the call team's detail stripped from hidden steps and from a held
    // decision before it gets here.
    const details = (
      s: ProposalWorkflowStepInstance,
      status: string,
      outcome?: string,
    ): WorkflowStepDetail[] => {
      const rows: WorkflowStepDetail[] = [];
      if (s.decided_automatically) {
        // Taken by the system itself; the completer only stood by in case
        // the award could not be made automatically.
        rows.push({
          label: translate('Completed by'),
          value: translate('System (decided automatically)'),
        });
      } else if (s.completer) {
        rows.push({
          label: translate('Completed by'),
          // A step completed by an evaluator role names it: "Evaluator
          // role" alone says nothing of who is meant.
          value:
            s.completer === 'proposal_role' && s.completer_proposal_role_name
              ? s.completer_proposal_role_name
              : responsibleRoleLabel(s.completer),
        });
      }
      rows.push({ label: translate('Status'), value: status });
      if (s.started_at) {
        rows.push({
          label: translate('Started'),
          value: formatDateTime(s.started_at),
        });
      }
      if (s.deadline && s.status !== 'completed') {
        rows.push({ label: translate('Due'), value: formatDate(s.deadline) });
      }
      // Why the step cannot move on, and what unblocks it.
      const waitingFor = s.waiting_for || s.awaiting_lead;
      if (waitingFor) {
        rows.push({ label: translate('Waiting for'), value: waitingFor });
      }
      if (s.completed_at) {
        rows.push({
          label: translate('Completed'),
          value: formatDateTime(s.completed_at),
        });
      }
      const results = perOffering(s);
      if (results?.results.length) {
        rows.push({
          label: translate('Per offering'),
          value: (
            <ul className="list-unstyled mb-0">
              {results.results.map((row, index) => (
                <li key={index}>
                  {row.offering}: {row.result}
                </li>
              ))}
            </ul>
          ),
        });
      } else if (outcome) {
        rows.push({ label: translate('Outcome'), value: outcome });
      }
      const reason = s.outcome_reason || s.rejection_reason;
      if (reason) {
        rows.push({ label: translate('Reason'), value: reason });
      }
      return rows;
    };

    // Prepend "Submission" as a synthetic completed step. The component only
    // renders on submitted proposals (drafts use the separate submission
    // form), so submission is always behind us — leaving the variant at the
    // default paints it with the brand colour, matching the other completed
    // checkpoints.
    // While the proposal waits for the round cut-off, the note hangs under
    // Submission: that is where the proposal stands, and no later step is
    // under way yet.
    const submission: ProgressStep = {
      key: 'submission',
      label: translate('Submission'),
      completed: true,
      description: awaitingCutoff && statusLine ? [statusLine.text] : undefined,
    };
    const rest = visibleStates.map<ProgressStep>((s, index) => {
      const key = s.call_step_uuid || s.uuid;
      // A step after the award belongs to an extension request or to the
      // final report, whatever the call named it.
      // A step whose name already says so ("Final report", "Extension
      // request results") is not prefixed a second time.
      const phase =
        s.run_uuid && s.phase && s.phase !== 'evaluation'
          ? runPhaseLabel(s.phase)
          : undefined;
      const name =
        phase && !s.step_name.toLowerCase().startsWith(phase.toLowerCase())
          ? `${phase}: ${s.step_name}`
          : s.step_name;
      const buttonLabel = translate('{name}: step details', { name });
      // Told by the stepper whether the step is the button that opens it.
      const label =
        (props: {
          details: WorkflowStepDetail[];
          description?: string;
          struck?: boolean;
        }) =>
        ({ clickable }: { clickable: boolean }) => (
          <WorkflowStepLabel
            name={name}
            open={openKey === key}
            onOpenChange={(open) => setOpenKey(open ? key : null)}
            openedByStep={clickable}
            {...props}
          />
        );

      if (heldIndex !== -1 && index >= heldIndex) {
        const isHeld = index === heldIndex;
        const held = heldDecisionLabel(s.outcome);
        return {
          key,
          buttonLabel,
          label: label({
            description: s.step_description,
            details: isHeld
              ? details(
                  s,
                  translate('Held until the round publishes results'),
                  held,
                )
              : details(s, statusLabel(s.status)),
          }),
          completed: isHeld,
          // Nothing is under way while the decision waits for the round, so
          // no later step may be highlighted as the current one.
          disabled: !isHeld,
          variant: isHeld ? 'warning' : undefined,
          description: [
            <span key="status" className="block px-1.5">
              {isHeld ? held : statusLabel(s.status)}
            </span>,
          ],
        };
      }
      const isFailure = failureIndex !== -1 && index === failureIndex;
      const isAfterFailure = failureIndex !== -1 && index > failureIndex;
      // A proposal rejected without a step-level outcome stops at a step that
      // never completed: its own status would read as still under way.
      const failedWithoutOutcome = isFailure && !s.outcome;
      const notNeeded = isConditionSkipped(s);
      const status = isAfterFailure
        ? failedStep
          ? translate('Not reached: rejected at {step}', {
              step: failedStep.step_name,
            })
          : translate('Not reached')
        : failedWithoutOutcome
          ? translate('Rejected')
          : notNeeded
            ? translate('Not needed')
            : statusLabel(s.status);
      const outcome = s.outcome ? outcomeLabel(s.outcome) : undefined;

      // A step the call keeps internal reaches the applicant as a stand-in
      // (see applicantTimeline): its popover says only what the stand-in
      // says, never when the call's own step started or is due.
      const standIn = !showDetails && !s.applicant_visible;

      // The line under the name. The call team gets every step's status;
      // the applicant keeps the tracker clean, with their one line under the
      // step it is about.
      // A label the call configured for the viewer's dashboard stands in for
      // the computed status; the backend sends it only where it is theirs.
      let line: ReactNode;
      if (isAfterFailure || notNeeded) {
        line = status;
      } else if (showDetails) {
        line =
          s.status_label || (failedWithoutOutcome ? status : shortStatus(s));
      } else if (s.status === 'active' && statusLine) {
        line = statusLine.text;
      } else if (
        s.status_label &&
        proposal.state !== 'canceled' &&
        !visibleStates
          .slice(index + 1)
          .some((later) => ['active', 'completed'].includes(later.status))
      ) {
        // The call's applicant label says where the proposal stands after
        // this step ("Under evaluation"): true only while nothing later has
        // been reached. Under a checkpoint the proposal has since left, it
        // would contradict the step that is current now, and on a withdrawn
        // proposal nothing is under way any more.
        line = s.status_label;
      }

      return {
        key,
        buttonLabel,
        label: label({
          description: s.step_description,
          details: standIn
            ? s.step_description
              ? []
              : [{ label: translate('Status'), value: status }]
            : details(s, status, outcome),
          struck: isAfterFailure,
        }),
        // Only the failure point needs a class of its own. The stepper already
        // paints the current step per the design system — `text-brand-primary`
        // at weight 500, and the status colour where a variant is set — so an
        // override here would just be this view disagreeing with the system.
        labelClass: isFailure ? 'text-danger' : undefined,
        // A failed step is a terminal red marker; treat it as "completed" so
        // it renders as a solid circle with the ✕ rather than an active dot.
        completed: s.status === 'completed' || isFailure || notNeeded,
        // Nothing is "in progress" once the proposal has failed: stop the
        // stepper from auto-highlighting a leftover incomplete step as the
        // current one. Steps past the failure are also struck through.
        disabled:
          isAfterFailure ||
          (failureIndex !== -1 && !isFailure && s.status !== 'completed') ||
          // Nothing has started before the cut-off: no step is current.
          (awaitingCutoff && s.status !== 'completed'),
        icon: isFailure ? <XIcon size={16} weight="bold" /> : undefined,
        // Brand colour for done/in-progress (default variant); red for the
        // failure point; amber where the active step is waiting on the
        // applicant; grey for everything past it and for pending steps.
        variant: isFailure
          ? 'danger'
          : s.status === 'active'
            ? statusLine?.variant
            : undefined,
        // Padded so that neighbouring lines never run into each other at
        // the columns' minimum width.
        description: line
          ? [
              <span key="status" className="block px-1.5">
                {line}
              </span>,
            ]
          : undefined,
      };
    });
    // Steps of one stage run at the same time: they share one checkpoint,
    // their names stacked, each still opening its own detail.
    let position = 0;
    const staged = groupByStage(visibleStates).map<ProgressStep>((group) => {
      const members = rest.slice(position, position + group.length);
      position += group.length;
      if (members.length === 1) return members[0];
      return {
        key: members[0].key,
        // Each name opens its own detail, so the checkpoint is no button.
        label: (
          <div className="flex flex-col gap-1">
            {members.map((member) => (
              <div key={member.key}>{member.label({ clickable: false })}</div>
            ))}
          </div>
        ),
        clickable: false,
        description: members.flatMap((member) => member.description ?? []),
        completed: members.every((member) => member.completed),
        disabled: members.every((member) => member.disabled),
        icon: members.find((member) => member.icon)?.icon,
        labelClass: members.find((member) => member.labelClass)?.labelClass,
        variant:
          members.find((member) => member.variant === 'danger')?.variant ??
          members.find((member) => member.variant)?.variant,
      };
    });
    return [submission, ...staged];
  }, [
    visibleStates,
    showDetails,
    failureIndex,
    failedStep,
    statusLine,
    awaitingCutoff,
    heldIndex,
    openKey,
    offeringResults,
  ]);

  // With more steps than fit, the stepper scrolls sideways; start it at the
  // step in flight rather than at Submission.
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentKey = steps.find(
    (step, i) =>
      !step.disabled && !step.completed && (i === 0 || steps[i - 1].completed),
  )?.key;
  useEffect(() => {
    const container = scrollRef.current;
    const current = container?.querySelector<HTMLElement>(
      '[aria-current="step"]',
    );
    if (!container || !current) return;
    container.scrollLeft =
      current.offsetLeft - (container.clientWidth - current.offsetWidth) / 2;
  }, [currentKey]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <div className="text-quaternary small">
        {translate('Could not load workflow progress.')}
      </div>
    );
  }
  // No configured workflow for this call — only the synthetic Submission step
  // would render. Fall back to the high-level Submission → Review → Decision
  // tracker so every submitted proposal still shows progress.
  if (steps.length <= 1) {
    return (
      <ProposalStateSteps
        proposal={proposal}
        bgClass="bg-primary"
        note={statusLine}
      />
    );
  }

  return (
    <Panel cardBordered className="overflow-hidden">
      {/* Each checkpoint keeps a readable minimum width; past what the panel
          holds, the row scrolls instead of squeezing every name to a
          sliver. A scroll box clips on both axes, so it leaves room for the
          current step's ring above and below. */}
      <div ref={scrollRef} className="overflow-x-auto py-1.5">
        <div style={{ minWidth: steps.length * STEP_MIN_WIDTH }}>
          <ProgressSteps
            steps={steps}
            bgClass="bg-primary"
            onClick={(step) =>
              step.key &&
              setOpenKey((current) => (current === step.key ? null : step.key))
            }
          />
        </div>
      </div>
      {/* Whether the call team has to press a button is their business, not
          the applicant's: from outside, parked and working both read as
          waiting. */}
      {showDetails && awaitingManualAdvance && (
        <div className="text-quaternary small mt-1.5 px-3 pb-2.5">
          {translate('Awaiting call manager approval to advance.')}
        </div>
      )}
    </Panel>
  );
};
