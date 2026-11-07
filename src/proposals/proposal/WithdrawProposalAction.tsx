import { ArrowUUpLeftIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { client } from 'waldur-js-client/client.gen';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { usesCallVocabulary } from '@/proposals/presentation';
import { useUser } from '@/workspace/hooks';

import { canWithdrawProposal } from '../team/teamRules';
import { Proposal } from '../types';
import { isAwardResponseStep } from '../workflow/constants';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

/** POST /api/proposal-proposals/{uuid}/withdraw/ — not yet in published waldur-js-client exports. */
const postWithdraw = (uuid: string, reason: string) =>
  client.post({
    url: '/api/proposal-proposals/{uuid}/withdraw/',
    path: { uuid },
    body: { reason },
    headers: { 'Content-Type': 'application/json' },
  });

const WITHDRAWABLE_STATES = ['submitted', 'in_review'];

/**
 * The applicant's way out of a submitted proposal while it is still being
 * evaluated. Once an award awaits their answer, declining it is the way out
 * instead, so the action steps aside for Accept/Decline then.
 */
export const WithdrawProposalAction: FC<{
  proposal: Proposal;
  refetch: () => void;
}> = ({ proposal, refetch }) => {
  const user = useUser();
  const { data } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
  });
  const awaitingAward = (data ?? []).some(
    (step) => step.status === 'active' && isAwardResponseStep(step),
  );

  const withdraw = useManagedMutation<any, any, { input?: string }>({
    mutationFn: (variables) =>
      postWithdraw(proposal.uuid, variables.input ?? ''),
    refetch,
    confirmation: {
      title: usesCallVocabulary()
        ? translate('Withdraw proposal')
        : translate('Withdraw request'),
      body: usesCallVocabulary()
        ? translate(
            'Withdraw "{name}" from evaluation? Its evaluation stops, and the call managers are told. A withdrawn proposal cannot be resubmitted.',
            { name: proposal.name },
          )
        : translate(
            'Withdraw "{name}"? Its review stops, and you would need to request access again.',
            { name: proposal.name },
          ),
      options: {
        showInput: true,
        inputLabel: translate('Reason (optional)'),
        inputRequired: false,
      },
    },
    successMessage: usesCallVocabulary()
      ? translate('Proposal withdrawn.')
      : translate('Request withdrawn.'),
    errorMessage: usesCallVocabulary()
      ? translate('Unable to withdraw the proposal.')
      : translate('Unable to withdraw the request.'),
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  if (
    !canWithdrawProposal(user, proposal) ||
    !WITHDRAWABLE_STATES.includes(proposal.state) ||
    awaitingAward
  ) {
    return null;
  }

  return (
    <BaseButton
      variant="tertiary"
      onClick={() => withdraw.mutate()}
      pending={withdraw.isPending}
      className="w-full mt-1.5"
      iconNode={<ArrowUUpLeftIcon weight="bold" />}
      label={
        usesCallVocabulary()
          ? translate('Withdraw proposal')
          : translate('Withdraw request')
      }
      size="lg"
    />
  );
};
