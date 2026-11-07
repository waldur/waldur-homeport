import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProposalsDelegateContribution,
  StepContribution,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal } from '@/proposals/types';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';
import { useUser } from '@/workspace/hooks';

import { proposalContributionsKey } from './queries';

interface DelegateContributionValues {
  user_uuid?: string;
}

interface DelegateContributionDialogProps {
  resolve: {
    proposal: Proposal;
    contribution: StepContribution;
    title: string;
    refetch?(): void;
  };
}

/**
 * Hand a contribution to one of the people the step allows -- an offering
 * manager of the slot's offering, or a holder of an evaluator role on the
 * proposal. They are told, and accept or decline it.
 */
export const DelegateContributionDialog: FC<
  DelegateContributionDialogProps
> = ({ resolve }) => {
  const { proposal, contribution, title, refetch } = resolve;
  const user = useUser();
  // Not to whoever it is handed on to now, nor to the one handing it on:
  // they fill it in themselves with Submit contribution.
  const options = useMemo(
    () =>
      contribution.delegation_candidates
        .filter(
          (candidate) =>
            candidate.uuid !== contribution.delegate_uuid &&
            candidate.uuid !== user?.uuid,
        )
        .map((candidate) => ({
          value: candidate.uuid,
          label: candidate.full_name,
        })),
    [contribution, user?.uuid],
  );

  const delegate = useManagedMutation<any, any, DelegateContributionValues>({
    mutationFn: (values) =>
      proposalProposalsDelegateContribution({
        path: { uuid: proposal.uuid },
        body: {
          contribution_uuid: contribution.uuid,
          user_uuid: values.user_uuid ?? null,
        },
      }),
    successMessage: translate('The contribution is handed on.'),
    errorMessage: translate('Unable to hand the contribution on.'),
    refetch,
    invalidateQueries: [
      { queryKey: proposalContributionsKey(proposal.uuid) },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
    ],
  });

  return (
    <Form<DelegateContributionValues>
      onSubmit={(values) => delegate.mutate(values)}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Hand on: {name}', { name: title })}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={delegate.isPending}
                  label={translate('Hand on')}
                />
              </>
            }
          >
            <SelectGroup
              label={translate('Person')}
              name="user_uuid"
              description={translate(
                'They accept or decline it. Once they accept, they fill it alone; you keep reading it and can take it back while it is open.',
              )}
              options={options}
              simpleValue
              required
              validate={required}
              placeholder={translate('Select a person...')}
              noOptionsMessage={() =>
                translate('Nobody else can take this contribution over.')
              }
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
