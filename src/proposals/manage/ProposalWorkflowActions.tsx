import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  OutcomeEnum,
  proposalProposalsAdvanceWorkflowStep,
  proposalProposalsCompleteWorkflowStep,
  proposalProposalsRejectWorkflowStep,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { BaseButton } from '@/core/buttons/BaseButton';
import { formatRelative } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { SelectGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { userHasRole } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import {
  outcomeLabel,
  responsibleRoleLabel,
  stepDefinition,
} from '../workflow/constants';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

interface ProposalWorkflowActionsProps {
  proposalUuid: string;
  callUuid: string;
  awaitingManualAdvance: boolean;
}

interface CompleteValues {
  outcome: OutcomeEnum | '';
  outcome_reason: string;
}

interface RejectValues {
  reason: string;
}

interface OutcomeOption {
  value: OutcomeEnum;
  label: string;
}

interface CompleteStepFormProps {
  outcomeOptions: OutcomeOption[];
  canReject: boolean;
  onSubmit(values: CompleteValues): Promise<unknown>;
  onReject(): void;
}

const CompleteStepForm: FC<CompleteStepFormProps> = ({
  outcomeOptions,
  canReject,
  onSubmit,
  onReject,
}) => (
  <Form<CompleteValues>
    onSubmit={onSubmit}
    initialValues={{ outcome: '', outcome_reason: '' }}
    render={({ handleSubmit, submitting, invalid }) => (
      <form onSubmit={handleSubmit}>
        <SelectGroup
          label={translate('Outcome')}
          required
          name="outcome"
          options={outcomeOptions}
          simpleValue
          placeholder={translate('Select outcome…')}
          validate={required}
        />
        <TextGroup
          label={translate('Notes')}
          name="outcome_reason"
          rows={2}
          placeholder={translate('Additional notes...')}
        />
        <div className="d-flex gap-2">
          <SubmitButton
            submitting={submitting}
            invalid={invalid}
            disabledReason={
              invalid ? translate('Select an outcome to continue.') : undefined
            }
            label={translate('Complete step')}
          />
          {canReject && (
            <BaseButton
              type="button"
              variant="danger"
              size="lg"
              onClick={onReject}
              label={translate('Reject proposal')}
            />
          )}
        </div>
      </form>
    )}
  />
);

interface RejectStepFormProps {
  onSubmit(values: RejectValues): Promise<unknown>;
  onCancel(): void;
}

const RejectStepForm: FC<RejectStepFormProps> = ({ onSubmit, onCancel }) => (
  <Form<RejectValues>
    onSubmit={onSubmit}
    initialValues={{ reason: '' }}
    render={({ handleSubmit, submitting, invalid }) => (
      <form onSubmit={handleSubmit}>
        <TextGroup
          label={translate('Rejection reason')}
          required
          name="reason"
          rows={3}
          placeholder={translate(
            'Explain why this proposal is being rejected...',
          )}
          validate={required}
        />
        <div className="d-flex gap-2">
          <SubmitButton
            submitting={submitting}
            invalid={invalid}
            disabledReason={
              invalid
                ? translate('Provide a rejection reason to continue.')
                : undefined
            }
            variant="danger"
            label={translate('Reject proposal')}
          />
          <BaseButton
            type="button"
            variant="tertiary"
            size="lg"
            onClick={onCancel}
            label={translate('Cancel')}
          />
        </div>
      </form>
    )}
  />
);

export const ProposalWorkflowActions: FC<ProposalWorkflowActionsProps> = ({
  proposalUuid,
  callUuid,
  awaitingManualAdvance,
}) => {
  const user = useUser();
  const { showSuccess, showError, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();
  const queryKey = proposalWorkflowStatesKey(proposalUuid);

  const userIsCallManager = userHasRole(user, 'CALL.MANAGER', callUuid);
  const userIsReviewer = userHasRole(user, 'CALL.REVIEWER', callUuid);
  // Applicants hold PROPOSAL.MANAGER on the proposal scope.
  const userIsApplicant = userHasRole(user, 'PROPOSAL.MANAGER', proposalUuid);
  // Hide the card from users who don't hold any actionable role on this proposal.
  const userMayAct = userIsCallManager || userIsReviewer || userIsApplicant;
  // Rejecting the whole proposal is an evaluator decision. Applicants only
  // reach this form for applicant-owned steps (e.g. award response), where
  // declining is expressed via the outcome — they must not see a hard
  // "Reject proposal" action (the backend would 403 anyway).
  const canReject = userIsCallManager || userIsReviewer;

  const { data: states } = useQuery({
    queryKey,
    queryFn: () => fetchProposalWorkflowStates(proposalUuid),
  });

  const currentStep = states?.find((s) => s.status === 'active') ?? null;
  const activeStepResponsibleRole = currentStep?.responsible_role ?? null;

  const userCanActOnActiveStep = useMemo(() => {
    // Call managers can complete or reject any step regardless of its
    // responsible role — they unblock stalled workflows on behalf of any
    // owner.
    if (userIsCallManager) return true;
    switch (activeStepResponsibleRole) {
      case 'reviewer':
        return userIsReviewer;
      case 'applicant':
        return userIsApplicant;
      // offering_manager / panel_member / unknown: no FE scope info to
      // verify membership, so show "Waiting on X" rather than a form that
      // would 403 on submit.
      default:
        return false;
    }
  }, [
    activeStepResponsibleRole,
    userIsCallManager,
    userIsReviewer,
    userIsApplicant,
  ]);

  const [showReject, setShowReject] = useState(false);

  // A workflow transition can flip both the step list and the proposal's
  // top-level state (e.g. award_response → 'accepted'). Refetch both so the
  // header badge and Submission/Review/Decision tracker stay in sync without
  // a manual page refresh.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['Proposal', proposalUuid] });
  };

  const handleMutationError = (error: unknown, fallbackMessage: string) => {
    const status =
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { status?: number })?.status;
    if (status === 409) {
      showError(translate('The workflow step has changed. Refreshing…'));
      invalidate();
      return;
    }
    if (status === 403) {
      showError(
        translate(
          "You don't hold the role required to act on the active workflow step.",
        ),
      );
      return;
    }
    showErrorResponse(error, fallbackMessage);
  };

  const completeMutation = useMutation({
    mutationFn: ({
      stepUuid,
      values,
    }: {
      stepUuid: string;
      values: CompleteValues;
    }) =>
      proposalProposalsCompleteWorkflowStep({
        path: { uuid: proposalUuid },
        body: {
          step_uuid: stepUuid,
          outcome: values.outcome as OutcomeEnum,
          outcome_reason: values.outcome_reason,
        },
      }),
    onSuccess: () => {
      showSuccess(translate('Workflow step completed.'));
      invalidate();
    },
    onError: (error) =>
      handleMutationError(
        error,
        translate('Unable to complete workflow step.'),
      ),
  });

  const advanceMutation = useMutation({
    mutationFn: () =>
      proposalProposalsAdvanceWorkflowStep({
        path: { uuid: proposalUuid },
      }),
    onSuccess: () => {
      showSuccess(translate('Workflow advanced to the next step.'));
      invalidate();
    },
    onError: (error) =>
      handleMutationError(error, translate('Unable to advance workflow.')),
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      stepUuid,
      values,
    }: {
      stepUuid: string;
      values: RejectValues;
    }) =>
      proposalProposalsRejectWorkflowStep({
        path: { uuid: proposalUuid },
        body: { step_uuid: stepUuid, reason: values.reason },
      }),
    onSuccess: () => {
      setShowReject(false);
      showSuccess(translate('Proposal rejected.'));
      invalidate();
    },
    onError: (error) =>
      handleMutationError(error, translate('Unable to reject proposal.')),
  });

  // Users without any role on this proposal see nothing — keeps the proposal
  // page clean for read-only viewers.
  if (!userMayAct) return null;

  // Manual transition mode: the previous step was completed but the workflow
  // is parked until the call manager confirms. Surface the proceed action to
  // the call manager and an informative wait state to everyone else.
  if (awaitingManualAdvance) {
    const lastCompleted = [...(states ?? [])]
      .reverse()
      .find((s) => s.status === 'completed');
    return (
      <div className="card mb-4">
        <div className="card-header d-flex align-items-center gap-3">
          <h5 className="mb-0">
            {lastCompleted
              ? translate('Completed: {step}', {
                  step: lastCompleted.step_name,
                })
              : translate('Workflow awaiting approval')}
          </h5>
          <Badge variant="warning" outline>
            {translate('Awaiting call manager approval')}
          </Badge>
        </div>
        <div className="card-body">
          {userIsCallManager ? (
            <>
              <p className="text-muted mb-3">
                {translate(
                  'Verify the step outcome and confirm to advance the workflow.',
                )}
              </p>
              <BaseButton
                type="button"
                variant="primary"
                size="lg"
                disabled={advanceMutation.isPending}
                disabledReason={
                  advanceMutation.isPending
                    ? translate('Advancing workflow…')
                    : undefined
                }
                onClick={() => advanceMutation.mutate()}
                label={translate('Proceed to next step')}
              />
            </>
          ) : (
            <p className="text-muted mb-0">
              {translate(
                'The call manager will review and advance the workflow.',
              )}
            </p>
          )}
        </div>
      </div>
    );
  }

  // No active step (workflow finished or not yet started). Surface a brief
  // note so users with an actionable role aren't left wondering whether the
  // card is missing or just inactive.
  if (!currentStep) {
    return (
      <div className="card mb-4">
        <div className="card-body text-muted">
          {translate('No workflow step currently needs action.')}
        </div>
      </div>
    );
  }

  // Active step belongs to a different role. Show whose turn it is rather
  // than hiding silently — call managers want visibility into bottlenecks.
  if (!userCanActOnActiveStep) {
    return (
      <div className="card mb-4">
        <div className="card-header d-flex align-items-center gap-3">
          <h5 className="mb-0">
            {translate('Current step')}: {currentStep.step_name}
          </h5>
          <Badge variant="primary">{translate('Active')}</Badge>
        </div>
        <div className="card-body text-muted">
          {activeStepResponsibleRole
            ? translate('Waiting on {role}.', {
                role: responsibleRoleLabel(activeStepResponsibleRole),
              })
            : translate('Waiting on another role to complete this step.')}
        </div>
      </div>
    );
  }

  const stepUuid = currentStep.uuid;
  const allowedOutcomes =
    stepDefinition(currentStep.step)?.allowedOutcomes ?? [];
  const outcomeOptions: OutcomeOption[] = allowedOutcomes.map((value) => ({
    value,
    label: outcomeLabel(value),
  }));
  const handleComplete = async (values: CompleteValues) => {
    try {
      await completeMutation.mutateAsync({ stepUuid, values });
    } catch {
      // onError already surfaced a toast.
    }
  };
  const handleReject = async (values: RejectValues) => {
    try {
      await rejectMutation.mutateAsync({ stepUuid, values });
    } catch {
      // onError already surfaced a toast.
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex align-items-center gap-3">
        <h5 className="mb-0">
          {translate('Current step')}: {currentStep.step_name}
        </h5>
        <Badge variant="primary">{translate('Active')}</Badge>
        {currentStep.deadline && (
          <span className="text-muted ms-auto">
            {translate('Deadline')}: {formatRelative(currentStep.deadline)}
          </span>
        )}
      </div>
      <div className="card-body">
        {showReject ? (
          <RejectStepForm
            key={stepUuid}
            onSubmit={handleReject}
            onCancel={() => setShowReject(false)}
          />
        ) : (
          <CompleteStepForm
            key={stepUuid}
            outcomeOptions={outcomeOptions}
            canReject={canReject}
            onSubmit={handleComplete}
            onReject={() => setShowReject(true)}
          />
        )}
      </div>
    </div>
  );
};
