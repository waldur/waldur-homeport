import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  OutcomeEnum,
  Proposal,
  proposalProposalsCompleteWorkflowStep,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { RadioGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { outcomeLabel } from '@/proposals/workflow/constants';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '@/proposals/workflow/queries';

import { BulkFailure, groupByDecisionStep, runEach } from './bulkSteps';

interface DecideValues {
  step: string;
  outcome: OutcomeEnum;
  outcome_reason?: string;
}

interface DecideProposalStepsDialogProps {
  resolve: {
    proposals: Pick<Proposal, 'uuid' | 'name'>[];
    refetch?(): void;
  };
}

interface Outcome {
  done: number;
  failures: BulkFailure[];
  leftAlone: number;
}

/**
 * A call manager takes one decision step -- the administrative or
 * eligibility check, say -- for a selection of proposals at once: one
 * outcome, one reason. Each proposal is completed on its own, through the
 * same action as its page, so the backend's gates still decide; a refusal
 * stops only that proposal and is listed by name.
 */
export const DecideProposalStepsDialog: FC<DecideProposalStepsDialogProps> = ({
  resolve: { proposals, refetch },
}) => {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<Outcome>();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['BulkDecisionSteps', proposals.map((p) => p.uuid)],
    queryFn: async () =>
      groupByDecisionStep(
        await Promise.all(
          proposals.map(async (proposal) => ({
            proposal,
            instances: await fetchProposalWorkflowStates(proposal.uuid),
          })),
        ),
      ),
    refetchOnWindowFocus: false,
  });

  const stepChoices = useMemo(
    () =>
      (groups ?? []).map((group) => ({
        value: group.callStepUuid,
        label: translate('{step} ({count})', {
          step: group.stepName,
          count: group.targets.length,
        }),
      })),
    [groups],
  );

  const submit = async (values: DecideValues) => {
    const group = groups.find((g) => g.callStepUuid === values.step);
    const outcome = await runEach(
      group.targets,
      ({ proposal, instance }) =>
        proposalProposalsCompleteWorkflowStep({
          path: { uuid: proposal.uuid },
          body: {
            step_uuid: instance.uuid,
            outcome: values.outcome,
            outcome_reason: values.outcome_reason || '',
          },
        }),
      ({ proposal }) => proposal.name,
    );
    group.targets.forEach(({ proposal }) =>
      queryClient.invalidateQueries({
        queryKey: proposalWorkflowStatesKey(proposal.uuid),
      }),
    );
    setResult({
      ...outcome,
      leftAlone: proposals.length - group.targets.length,
    });
    if (outcome.done) refetch?.();
  };

  const title = translate('Decide a step ({count} selected)', {
    count: proposals.length,
  });

  if (isLoading) {
    return (
      <ModalDialog title={title} footer={<CloseDialogButton />}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  if (result) {
    return (
      <ModalDialog
        title={title}
        footer={<CloseDialogButton label={translate('Done')} />}
      >
        <div className="flex flex-col gap-3">
          {result.done > 0 && (
            <AlertItem
              type="floating"
              variant="success"
              title={translate('Completed: {count}', {
                count: result.done,
              })}
            />
          )}
          {result.failures.length > 0 && (
            <AlertItem
              type="floating"
              variant="error"
              title={translate('Refused: {count}', {
                count: result.failures.length,
              })}
              body={
                <ul className="mb-0 ps-4" data-testid="bulk-failures">
                  {result.failures.map((failure) => (
                    <li key={failure.name}>
                      <span className="font-medium">{failure.name}</span>:{' '}
                      {failure.reason}
                    </li>
                  ))}
                </ul>
              }
            />
          )}
          {result.leftAlone > 0 && (
            <p className="text-tertiary mb-0">
              {translate('Not at this step, so left alone: {count}', {
                count: result.leftAlone,
              })}
            </p>
          )}
        </div>
      </ModalDialog>
    );
  }

  if (!groups?.length) {
    return (
      <ModalDialog title={title} footer={<CloseDialogButton />}>
        <p className="mb-0">
          {translate(
            'None of the selected proposals is at a decision step that can be taken for several at once. The allocation decision, assessments and steps taken per round are decided on each proposal.',
          )}
        </p>
      </ModalDialog>
    );
  }

  return (
    <Form<DecideValues>
      onSubmit={submit}
      initialValues={{ step: groups[0].callStepUuid }}
    >
      {({ handleSubmit, submitting, values }) => {
        const group = groups.find((g) => g.callStepUuid === values.step);
        const leftAlone = proposals.length - (group?.targets.length ?? 0);
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={title}
              subtitle={translate(
                'One outcome and reason for every selected proposal standing on the step. Each is completed as from its own page; one that is refused is listed and the others go on.',
              )}
              footer={
                <>
                  <CloseDialogButton variant="tertiary" />
                  <SubmitButton
                    submitting={submitting}
                    label={translate('Complete ({count})', {
                      count: group?.targets.length ?? 0,
                    })}
                  />
                </>
              }
            >
              {groups.length > 1 && (
                <RadioGroup
                  name="step"
                  label={translate('Step')}
                  required
                  choices={stepChoices}
                />
              )}
              <RadioGroup
                key={values.step}
                name="outcome"
                label={translate('Outcome')}
                required
                validate={(value) =>
                  required(value) ||
                  (group?.allowedOutcomes.includes(value)
                    ? undefined
                    : translate('Choose an outcome of this step.'))
                }
                choices={(group?.allowedOutcomes ?? []).map((outcome) => ({
                  value: outcome,
                  label: outcomeLabel(outcome),
                }))}
              />
              <TextGroup
                name="outcome_reason"
                label={translate('Reason')}
                description={translate(
                  'Recorded on each proposal with the outcome.',
                )}
              />
              {leftAlone > 0 && (
                <p className="text-tertiary mb-0">
                  {groups.length > 1
                    ? translate('Not at this step, so left alone: {count}', {
                        count: leftAlone,
                      })
                    : translate('Not at {step}, so left alone: {count}', {
                        count: leftAlone,
                        step: group?.stepName,
                      })}
                </p>
              )}
            </ModalDialog>
          </form>
        );
      }}
    </Form>
  );
};
