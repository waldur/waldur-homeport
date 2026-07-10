import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { proposalProposalsCompleteWorkflowStep } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

import { Proposal } from '../types';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

interface AwardResponseActionsProps {
  proposal: Proposal;
  refetch: () => void;
}

// Applicant-facing accept/decline control for the award_response step (WAL-9349).
// When a call enables the award response, the applicant either accepts the award
// (→ resources are provisioned) or declines it with a reason (→ the proposal is
// canceled). The backend authorises the proposal creator; this surfaces the
// control only to them.
export const AwardResponseActions: FC<AwardResponseActionsProps> = ({
  proposal,
  refetch,
}) => {
  const user = useUser();

  const { data } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
  });

  const activeStep = useMemo(
    () => (data ?? []).find((s) => s.status === 'active'),
    [data],
  );

  const isApplicant = !!user?.uuid && user.uuid === proposal.created_by_uuid;
  const isAwardStep = activeStep?.step === 'award_response';

  const acceptAward = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsCompleteWorkflowStep({
        path: { uuid: proposal.uuid },
        body: { step_uuid: activeStep!.uuid, outcome: 'accepted' },
      }),
    refetch,
    confirmation: {
      title: translate('Accept award'),
      body: translate(
        'Accept the award for "{name}"? The requested resources will be provisioned.',
        { name: proposal.name },
      ),
    },
    successMessage: translate('Award accepted.'),
    errorMessage: translate('Unable to accept the award.'),
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  const declineAward = useManagedMutation<any, any, { input: string }>({
    mutationFn: (variables) =>
      proposalProposalsCompleteWorkflowStep({
        path: { uuid: proposal.uuid },
        body: {
          step_uuid: activeStep!.uuid,
          outcome: 'declined',
          outcome_reason: variables.input,
        },
      }),
    refetch,
    confirmation: {
      title: translate('Decline award'),
      body: translate(
        'Decline the award for "{name}"? The proposal will be canceled.',
        { name: proposal.name },
      ),
      options: {
        showInput: true,
        inputLabel: translate('Reason for declining'),
        inputPlaceholder: translate('Enter a reason for declining the award'),
        inputRequired: true,
      },
    },
    successMessage: translate('Award declined.'),
    errorMessage: translate('Unable to decline the award.'),
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  if (!isApplicant || !isAwardStep) return null;

  return (
    <>
      <ActionButton
        variant="primary"
        action={() => acceptAward.mutate()}
        pending={acceptAward.isPending}
        className="w-100 mt-2"
        iconNode={<CheckCircleIcon weight="bold" />}
        title={translate('Accept award')}
      />
      <ActionButton
        variant="danger"
        action={() => declineAward.mutate()}
        pending={declineAward.isPending}
        className="w-100 mt-2"
        iconNode={<XCircleIcon weight="bold" />}
        title={translate('Decline award')}
      />
    </>
  );
};
