import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProposalsSubmitContribution,
  ProposalWorkflowStepInstance,
  StepContribution,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { SelectGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal } from '@/proposals/types';
import { contributionOutcomeLabel } from '@/proposals/workflow/constants';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';
import { useNotify } from '@/store/notify';

import { proposalContributionsKey } from './queries';

interface SubmitContributionValues {
  outcome?: string;
  conditions?: string;
  comment?: string;
}

const refusalReason = (error): string | undefined => {
  const status = error?.response?.status ?? error?.status;
  if (status !== 400) return undefined;
  const detail = getErrorBody(error)?.detail;
  if (Array.isArray(detail)) return detail.join(' ');
  return typeof detail === 'string' ? detail : undefined;
};

interface SubmitContributionDialogProps {
  resolve: {
    proposal: Proposal;
    step: ProposalWorkflowStepInstance;
    contribution: StepContribution;
    title: string;
    refetch?(): void;
  };
}

/**
 * Submit one contribution with what it concludes. On a per-offering step the
 * outcome is accepted, conditionally accepted (with its conditions) or
 * rejected; the last contribution in completes the step.
 */
export const SubmitContributionDialog: FC<SubmitContributionDialogProps> = ({
  resolve,
}) => {
  const { proposal, step, contribution, title, refetch } = resolve;
  const outcomes = step.contribution_outcomes ?? [];
  const options = useMemo(
    () =>
      outcomes.map((value) => ({
        value,
        label: contributionOutcomeLabel(value),
      })),
    [outcomes],
  );
  const { showErrorResponse } = useNotify();
  const [refusal, setRefusal] = useState<string>();

  const submit = useManagedMutation<any, any, SubmitContributionValues>({
    mutationFn: (values) =>
      proposalProposalsSubmitContribution({
        path: { uuid: proposal.uuid },
        body: {
          contribution_uuid: contribution.uuid,
          outcome: values.outcome ?? '',
          conditions:
            values.outcome === 'conditionally_accepted'
              ? (values.conditions ?? '')
              : '',
          comment: values.comment ?? '',
        },
      }),
    successMessage: translate('Contribution submitted.'),
    onMutate: () => setRefusal(undefined),
    onError: (error) => {
      const reason = refusalReason(error);
      if (reason) {
        setRefusal(reason);
      } else {
        showErrorResponse(
          error,
          translate('Unable to submit the contribution.'),
        );
      }
    },
    refetch,
    invalidateQueries: [
      { queryKey: proposalContributionsKey(proposal.uuid) },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
    ],
  });

  return (
    <Form<SubmitContributionValues>
      onSubmit={(values) => submit.mutate(values)}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Submit contribution: {name}', { name: title })}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submit.isPending}
                  label={translate('Submit')}
                />
              </>
            }
          >
            {step.can_suggest_reviewers && (
              <AlertItem
                variant="info"
                type="floating"
                className="mb-4"
                title={translate(
                  'Suggest reviewers before you submit: once your contribution is submitted, you cannot suggest more.',
                )}
              />
            )}
            {refusal && (
              <AlertItem
                variant="error"
                type="floating"
                className="mb-4"
                title={translate('The contribution cannot be submitted yet')}
                body={refusal}
              />
            )}
            {options.length > 0 && (
              <SelectGroup
                label={translate('Outcome')}
                name="outcome"
                options={options}
                simpleValue
                required
                validate={required}
                placeholder={translate('Select an outcome...')}
              />
            )}
            {values.outcome === 'conditionally_accepted' && (
              <TextGroup
                name="conditions"
                label={translate('Conditions')}
                required
                validate={required}
                maxLength={2000}
                placeholder={translate(
                  'The conditions under which the offering can serve the proposal',
                )}
              />
            )}
            <TextGroup
              name="comment"
              label={translate('Comment')}
              maxLength={2000}
              placeholder={translate('Optional explanation')}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
