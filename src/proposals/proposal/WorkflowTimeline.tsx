import { InfoIcon, XIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { formatRelative } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { ProgressStep, ProgressSteps } from '@/wizard';

import { Proposal } from '../types';
import {
  outcomeLabel,
  responsibleRoleLabel,
  statusLabel,
} from '../workflow/constants';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

import { ProgressSteps as ProposalStateSteps } from './create/ProgressSteps';

interface WorkflowTimelineProps {
  proposal: Proposal;
  /** Show per-step details (status, owner, dates, outcome) beneath each
   *  checkpoint. Call-manager view turns this on; the applicant view keeps
   *  the tracker clean with step labels only. */
  showDetails?: boolean;
}

export const WorkflowTimeline: FC<WorkflowTimelineProps> = ({
  proposal,
  showDetails = false,
}) => {
  // TODO: Remove cast once the regenerated SDK ships
  // `awaiting_manual_advance` on Proposal.
  const awaitingManualAdvance =
    (proposal as any).awaiting_manual_advance ?? false;

  const { data, isLoading, isError } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
  });

  const visibleStates = useMemo<ProposalWorkflowStepInstance[]>(
    () => (data ?? []).filter((s) => s.status !== 'skipped'),
    [data],
  );

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
      return visibleStates.findIndex((s) => s.status !== 'completed');
    }
    return -1;
  }, [visibleStates, proposal.state]);

  const steps = useMemo<ProgressStep[]>(() => {
    // Compact per-step detail: "<status> · <owner> · <date>" on one line, with
    // the outcome (if any) on a second — keeps the tracker from stacking four
    // rows of text under each checkpoint.
    const detailLines = (s: ProposalWorkflowStepInstance) => {
      const parts = [statusLabel(s.status)];
      if (s.responsible_role) {
        parts.push(responsibleRoleLabel(s.responsible_role));
      }
      if (s.status === 'completed' && s.completed_at) {
        parts.push(formatRelative(s.completed_at));
      } else if (s.status === 'active' && s.deadline) {
        parts.push(
          translate('Due {date}', { date: formatRelative(s.deadline) }),
        );
      }
      const lines = [parts.join(' · ')];
      if (s.outcome) lines.push(outcomeLabel(s.outcome));
      return lines;
    };

    // Prepend "Submission" as a synthetic completed step. The component only
    // renders on submitted proposals (drafts use the separate submission
    // form), so submission is always behind us — leaving the variant at the
    // default paints it with the brand colour, matching the other completed
    // checkpoints.
    const submission: ProgressStep = {
      key: 'submission',
      label: translate('Submission'),
      completed: true,
    };
    const rest = visibleStates.map<ProgressStep>((s, index) => {
      const isFailure = failureIndex !== -1 && index === failureIndex;
      const isAfterFailure = failureIndex !== -1 && index > failureIndex;
      const hasReason = s.rejection_reason !== null;

      let label: ProgressStep['label'];
      if (isAfterFailure) {
        label = (
          <span className="text-decoration-line-through">{s.step_name}</span>
        );
      } else if (isFailure && hasReason) {
        label = (
          <span className="d-inline-flex align-items-center gap-1">
            {s.step_name}
            <Tip
              id={`rejection-${s.uuid}`}
              label={translate('Proposal was rejected')}
              body={s.rejection_reason ?? ''}
              autoWidth
            >
              <InfoIcon size={16} weight="bold" className="text-gray-600" />
            </Tip>
          </span>
        );
      } else {
        label = s.step_name;
      }

      return {
        key: s.step,
        label,
        // Colour the active step's label with the brand (green) so it reads as
        // the current step rather than blending in with the pending ones. The
        // stepper's own `.current` rule only greys the title; a utility class
        // wins via !important (enable-important-utilities).
        labelClass: isFailure
          ? 'text-danger'
          : s.status === 'active'
            ? 'text-primary fw-semibold'
            : undefined,
        // A failed step is a terminal red marker; treat it as "completed" so
        // it renders as a solid circle with the ✕ rather than an active dot.
        completed: s.status === 'completed' || isFailure,
        // Nothing is "in progress" once the proposal has failed: stop the
        // stepper from auto-highlighting a leftover incomplete step as the
        // current one. Steps past the failure are also struck through below.
        disabled:
          isAfterFailure ||
          (failureIndex !== -1 && !isFailure && s.status !== 'completed'),
        icon: isFailure ? <XIcon size={16} weight="bold" /> : undefined,
        // Brand colour for done/in-progress (default variant); red for the
        // failure point; grey for everything past it and for pending steps.
        variant: isFailure ? 'danger' : undefined,
        description: isAfterFailure
          ? [translate('Not reached')]
          : showDetails
            ? detailLines(s)
            : undefined,
      };
    });
    return [submission, ...rest];
  }, [visibleStates, showDetails, failureIndex]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <div className="text-muted small">
        {translate('Could not load workflow progress.')}
      </div>
    );
  }
  // No configured workflow for this call — only the synthetic Submission step
  // would render. Fall back to the high-level Submission → Review → Decision
  // tracker so every submitted proposal still shows progress.
  if (steps.length <= 1) {
    return <ProposalStateSteps proposal={proposal} bgClass="bg-body" />;
  }

  return (
    <Panel cardBordered className="overflow-hidden">
      <ProgressSteps steps={steps} bgClass="bg-body" />
      {awaitingManualAdvance && (
        <div className="text-muted small mt-2 px-4 pb-3">
          {translate('Awaiting call manager approval to advance.')}
        </div>
      )}
    </Panel>
  );
};
