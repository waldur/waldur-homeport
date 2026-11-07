import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';
import {
  CompleteRoundWorkflowStepResponse,
  OutcomeEnum,
  proposalProposalsList,
  proposalProtectedCallsRoundsCompleteWorkflowStep,
  ProtectedRound,
  RoundStepProposalResult,
} from 'waldur-js-client';

import { BaseButton, EmptyState } from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Call } from '@/proposals/types';
import { outcomeLabel } from '@/proposals/workflow/constants';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '@/proposals/workflow/queries';
import { useNotify } from '@/store/notify';

interface CompleteRoundStepDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

interface Option {
  value: string;
  label: string;
}

interface StepFormValues {
  step?: Option;
  outcome?: Option;
  feedback?: Record<string, string>;
}

const roundStepProposalsKey = (roundUuid: string) =>
  ['round-step-proposals', roundUuid] as const;

/** The round's proposals in review, with the step each is at. */
const useRoundStepProposals = (roundUuid: string) =>
  useQuery({
    queryKey: roundStepProposalsKey(roundUuid),
    queryFn: () =>
      getAllPages((page) =>
        proposalProposalsList({
          query: {
            round_uuid: roundUuid,
            state: ['in_review'],
            page,
            page_size: MAX_PAGE_SIZE,
          },
        }),
      ),
    refetchOnWindowFocus: false,
  });

const ResultList: FC<{
  title: string;
  rows: RoundStepProposalResult[];
  testId: string;
}> = ({ title, rows, testId }) =>
  rows.length ? (
    <div className="mb-3" data-testid={testId}>
      <div className="font-medium mb-1.5">
        {title} ({rows.length})
      </div>
      <ul className="mb-0">
        {rows.map((row) => (
          <li key={row.proposal_uuid}>
            <span className="font-semibold">{row.proposal_name}</span>
            {' — '}
            {row.detail}
            {row.current_step_name
              ? ` (${translate('at {step}', { step: row.current_step_name })})`
              : null}
          </li>
        ))}
      </ul>
    </div>
  ) : null;

/** The round's proposals at the step picked, each with a feedback field. */
const FeedbackFields: FC<{ roundUuid: string }> = ({ roundUuid }) => {
  const { values } = useFormState<StepFormValues>();
  const stepKey = values.step?.value;
  const { data, isLoading } = useRoundStepProposals(roundUuid);
  const atStep = useMemo(
    () => (data ?? []).filter((proposal) => proposal.workflow_step === stepKey),
    [data, stepKey],
  );
  if (!stepKey) return null;
  if (isLoading) return <LoadingSpinner />;
  if (!atStep.length) {
    return (
      <EmptyState
        message={translate('No proposal of this round is at this step now.')}
      />
    );
  }
  return (
    <>
      <div className="font-medium mb-1">
        {translate('{count} proposal(s) at this step', {
          count: atStep.length,
        })}
      </div>
      <p className="text-quaternary text-xs">
        {translate(
          "Feedback is optional. It is stored with that proposal's outcome for the step, as when the step is completed on the proposal: where the step's report is released to the applicant, it waits for that release.",
        )}
      </p>
      {atStep.map((proposal) => (
        <TextGroup
          key={proposal.uuid}
          name={`feedback.${proposal.uuid}`}
          label={proposal.name}
          rows={2}
          placeholder={translate('Feedback for this proposal')}
        />
      ))}
    </>
  );
};

const OutcomeField: FC<{ outcomesByStep: Record<string, string[]> }> = ({
  outcomesByStep,
}) => {
  const form = useForm<StepFormValues>();
  const { values } = useFormState<StepFormValues>();
  // An outcome picked for one step is not an answer for another.
  const stepKey = values.step?.value;
  const previousStep = useRef(stepKey);
  useEffect(() => {
    if (previousStep.current !== stepKey) {
      previousStep.current = stepKey;
      form.change('outcome', undefined);
    }
  }, [stepKey, form]);
  const options = (outcomesByStep[values.step?.value ?? ''] ?? []).map(
    (outcome) => ({ value: outcome, label: outcomeLabel(outcome) }),
  );
  return (
    <SelectGroup
      name="outcome"
      label={translate('Outcome')}
      required
      validate={required}
      options={options}
      isDisabled={!values.step}
      placeholder={translate('Select outcome...')}
    />
  );
};

/**
 * Complete one call step for every proposal of the round where it is active,
 * such as the committee meeting or the ranking. Each proposal goes through
 * the step's own completion, so its gates and notifications apply, and is
 * committed on its own: one that cannot be completed is listed with the
 * reason while the others go on. Proposals not at the step are listed as
 * skipped. Running it again changes nothing. The allocation decision is not
 * offered: awards are settled on each proposal.
 */
export const CompleteRoundStepDialog: FC<CompleteRoundStepDialogProps> = ({
  resolve: { round, call, refetch },
}) => {
  const { showErrorResponse } = useNotify();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<CompleteRoundWorkflowStepResponse>();
  // The values being confirmed, and kept when going back to the form.
  const [draft, setDraft] = useState<StepFormValues>();
  const [confirming, setConfirming] = useState(false);
  const proposals = useRoundStepProposals(round.uuid);
  const steps = useQuery({
    queryKey: callWorkflowStepsKey(call.uuid),
    queryFn: () => fetchCallWorkflowSteps(call.uuid),
    refetchOnWindowFocus: false,
  });
  const stepOptions = useMemo(
    () =>
      (steps.data ?? [])
        .filter(
          (step) =>
            step.is_enabled !== false &&
            step.completer !== 'applicant' &&
            !step.is_allocation_decision,
        )
        .map((step) => ({ value: step.key, label: step.name || step.key })),
    [steps.data],
  );
  const outcomesByStep = useMemo(
    () =>
      Object.fromEntries(
        (steps.data ?? []).map((step) => [
          step.key,
          (step.allowed_outcomes ?? []).filter(
            (outcome) => outcome !== 'rejected' && outcome !== 'expired',
          ),
        ]),
      ),
    [steps.data],
  );

  const atStepUuids = useMemo(
    () =>
      new Set(
        (proposals.data ?? [])
          .filter((proposal) => proposal.workflow_step === draft?.step?.value)
          .map((proposal) => proposal.uuid),
      ),
    [proposals.data, draft?.step?.value],
  );

  const complete = useMutation({
    mutationFn: (values: StepFormValues) =>
      proposalProtectedCallsRoundsCompleteWorkflowStep({
        path: { uuid: call.uuid, obj_uuid: round.uuid },
        body: {
          step: values.step?.value,
          outcome: values.outcome?.value as OutcomeEnum,
          // Only what was written for the proposals at the step picked.
          feedback: Object.entries(values.feedback ?? {})
            .filter(
              ([proposal_uuid, text]) =>
                atStepUuids.has(proposal_uuid) && text?.trim(),
            )
            .map(([proposal_uuid, feedback]) => ({
              proposal_uuid,
              feedback: feedback.trim(),
            })),
        },
      }).then((response) => response.data),
    onSuccess: (data) => {
      setResult(data);
      setConfirming(false);
      setDraft(undefined);
      void queryClient.invalidateQueries({
        queryKey: roundStepProposalsKey(round.uuid),
      });
      refetch();
    },
    onError: (error) =>
      showErrorResponse(error, translate('Unable to complete the step.')),
  });

  if (confirming && draft) {
    return (
      <ModalDialog
        title={translate('Complete {step} for {count} proposal(s)?', {
          step: draft.step?.label,
          count: atStepUuids.size,
        })}
        footer={
          <>
            <BaseButton
              label={translate('Back')}
              variant="tertiary"
              onClick={() => setConfirming(false)}
              disabled={complete.isPending}
              disabledReason={translate('Completing the step…')}
            />
            <BaseButton
              label={translate('Complete for {count} proposal(s)', {
                count: atStepUuids.size,
              })}
              onClick={() => complete.mutate(draft)}
              pending={complete.isPending}
              data-testid="round-step-confirm"
            />
          </>
        }
      >
        <p>
          {translate(
            '{count} proposal(s) of {round} are at {step} now. Each will be completed as {outcome}, with the same gates and notifications as on the proposal.',
            {
              count: atStepUuids.size,
              round: round.name,
              step: draft.step?.label,
              outcome: draft.outcome?.label,
            },
          )}
        </p>
        <p className="text-quaternary mb-0">
          {translate(
            'Each proposal is committed on its own: one that cannot be completed is listed with the reason and the others go on. This cannot be undone.',
          )}
        </p>
      </ModalDialog>
    );
  }

  if (result) {
    return (
      <ModalDialog
        title={translate('{step} completed for {round}', {
          step: result.step_name,
          round: round.name,
        })}
        footer={<CloseDialogButton label={translate('Done')} />}
      >
        <ResultList
          title={translate('Completed')}
          rows={result.completed}
          testId="round-step-completed"
        />
        <ResultList
          title={translate('Not completed')}
          rows={result.failed}
          testId="round-step-failed"
        />
        <ResultList
          title={translate('Skipped')}
          rows={result.skipped}
          testId="round-step-skipped"
        />
        {!result.completed.length &&
        !result.failed.length &&
        !result.skipped.length ? (
          <EmptyState
            className="mb-3"
            message={translate('The round has no proposals.')}
          />
        ) : null}
        <BaseButton
          label={translate('Complete another step')}
          variant="tertiary"
          onClick={() => setResult(undefined)}
        />
      </ModalDialog>
    );
  }

  return (
    <Form<StepFormValues>
      initialValues={draft}
      onSubmit={(values) => {
        setDraft(values);
        setConfirming(true);
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Complete a step for {round}', {
              round: round.name,
            })}
            subtitle={translate(
              'Completes the step with one outcome for every proposal of the round where it is active. Proposals elsewhere in their evaluation are skipped and listed.',
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Continue')}
                />
              </>
            }
          >
            {steps.isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SelectGroup
                  name="step"
                  label={translate('Step')}
                  required
                  validate={required}
                  options={stepOptions}
                  placeholder={translate('Select step...')}
                />
                <OutcomeField outcomesByStep={outcomesByStep} />
                <FeedbackFields roundUuid={round.uuid} />
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
