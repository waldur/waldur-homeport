import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { formatRelative } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { ProgressStep, ProgressSteps } from '@/wizard';

import {
  responsibleRoleLabel,
  statusLabel,
  statusVariant,
} from '../workflow/constants';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

interface WorkflowTimelineProps {
  proposalUuid: string;
  awaitingManualAdvance?: boolean;
  /** Show per-step details (status, owner, dates, outcome) beneath each
   *  checkpoint. Call-manager view turns this on; the applicant view keeps
   *  the tracker clean with step labels only. */
  showDetails?: boolean;
}

export const WorkflowTimeline: FC<WorkflowTimelineProps> = ({
  proposalUuid,
  awaitingManualAdvance,
  showDetails = false,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposalUuid),
    queryFn: () => fetchProposalWorkflowStates(proposalUuid),
  });

  const visibleStates = useMemo<ProposalWorkflowStepInstance[]>(
    () => (data ?? []).filter((s) => s.status !== 'skipped'),
    [data],
  );

  const steps = useMemo<ProgressStep[]>(() => {
    // Prepend "Submission" as a synthetic completed step. The component only
    // renders on submitted proposals (drafts use the separate submission
    // form), so submission is always behind us at this point and the marker
    // gives the tracker a stable anchor that matches the Figma layout.
    const submission: ProgressStep = {
      key: 'submission',
      label: translate('Submission'),
      completed: true,
      variant: 'success',
    };
    const rest = visibleStates.map<ProgressStep>((s) => ({
      key: s.step,
      label: s.step_name,
      completed: s.status === 'completed',
      variant: statusVariant(s.status),
      description: showDetails
        ? [
            statusLabel(s.status),
            ...(s.responsible_role
              ? [
                  translate('Owner: {role}', {
                    role: responsibleRoleLabel(s.responsible_role),
                  }),
                ]
              : []),
            ...(s.status === 'completed' && s.completed_at
              ? [formatRelative(s.completed_at)]
              : []),
            ...(s.status === 'active' && s.deadline
              ? [
                  translate('Due: {date}', {
                    date: formatRelative(s.deadline),
                  }),
                ]
              : []),
            ...(s.outcome ? [s.outcome] : []),
          ]
        : undefined,
    }));
    return [submission, ...rest];
  }, [visibleStates, showDetails]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <div className="text-muted small">
        {translate('Could not load workflow progress.')}
      </div>
    );
  }
  // Only the synthetic Submission step would render — skip until the backend
  // returns the configured workflow.
  if (steps.length <= 1) return null;

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
