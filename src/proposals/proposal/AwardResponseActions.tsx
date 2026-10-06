import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { proposalProposalsCompleteWorkflowStep } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { AwardComparisonRow, awardDiffers } from '@/proposals/awardedResources';
import { usesCallVocabulary } from '@/proposals/presentation';
import { useUser } from '@/workspace/hooks';

import { Proposal } from '../types';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

import { isProposalApplicant } from './applicantTimeline';

interface AwardResponseActionsProps {
  proposal: Proposal;
  refetch: () => void;
  /** The award set against the request, once the applicant may read it. */
  awardRows?: AwardComparisonRow[];
}

// Applicant-facing accept/decline control for the award_response step (WAL-9349).
// When a call enables the award response, the applicant either accepts the award
// (→ resources are provisioned) or declines it with a reason (→ the proposal is
// canceled). The backend authorises the proposal creator; this surfaces the
// control only to them.
export const AwardResponseActions: FC<AwardResponseActionsProps> = ({
  proposal,
  refetch,
  awardRows,
}) => {
  const user = useUser();
  // What is provisioned on acceptance is the award, which the allocation
  // decision may have changed; the applicant should not accept thinking it is
  // their request.
  const hasAward = Boolean(awardRows?.length);
  const differs = hasAward && awardDiffers(awardRows);

  const { data } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
  });

  const activeStep = useMemo(
    () => (data ?? []).find((s) => s.status === 'active'),
    [data],
  );

  const isApplicant = isProposalApplicant(user, proposal);
  const isAwardStep = activeStep?.step === 'award_response';

  const acceptAward = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsCompleteWorkflowStep({
        path: { uuid: proposal.uuid },
        body: { step_uuid: activeStep!.uuid, outcome: 'accepted' },
      }),
    refetch,
    confirmation: {
      title: usesCallVocabulary()
        ? translate('Accept award')
        : translate('Accept'),
      body: hasAward
        ? differs
          ? translate(
              'Accept "{name}"? The awarded resources will be provisioned. They differ from what was requested; see Awarded resources.',
              { name: proposal.name },
            )
          : translate(
              'Accept "{name}"? The awarded resources will be provisioned.',
              { name: proposal.name },
            )
        : usesCallVocabulary()
          ? translate(
              'Accept the award for "{name}"? The requested resources will be provisioned.',
              { name: proposal.name },
            )
          : translate(
              'Accept "{name}"? The requested resources will be provisioned.',
              { name: proposal.name },
            ),
    },
    successMessage: usesCallVocabulary()
      ? translate('Award accepted.')
      : translate('Request accepted.'),
    errorMessage: usesCallVocabulary()
      ? translate('Unable to accept the award.')
      : translate('Unable to accept the request.'),
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
      title: usesCallVocabulary()
        ? translate('Decline award')
        : translate('Decline'),
      body: usesCallVocabulary()
        ? translate(
            'Decline the award for "{name}"? The proposal will be canceled.',
            { name: proposal.name },
          )
        : translate('Decline "{name}"? The request will be withdrawn.', {
            name: proposal.name,
          }),
      options: {
        showInput: true,
        inputLabel: translate('Reason for declining'),
        inputPlaceholder: usesCallVocabulary()
          ? translate('Enter a reason for declining the award')
          : translate('Enter a reason for declining'),
        inputRequired: true,
      },
    },
    successMessage: usesCallVocabulary()
      ? translate('Award declined.')
      : translate('Request declined.'),
    errorMessage: usesCallVocabulary()
      ? translate('Unable to decline the award.')
      : translate('Unable to decline the request.'),
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  if (!isApplicant || !isAwardStep) return null;

  return (
    <>
      {differs && (
        <AlertItem
          variant="warning"
          type="floating"
          className="mt-2"
          title={translate('The award differs from your request')}
          body={translate(
            'Compare the amounts and offerings under Awarded resources before you respond.',
          )}
        />
      )}
      <BaseButton
        variant="primary"
        onClick={() => acceptAward.mutate()}
        pending={acceptAward.isPending}
        className="w-100 mt-2"
        iconNode={<CheckCircleIcon weight="bold" />}
        label={
          usesCallVocabulary() ? translate('Accept award') : translate('Accept')
        }
        size="lg"
      />
      <BaseButton
        variant="danger"
        onClick={() => declineAward.mutate()}
        pending={declineAward.isPending}
        className="w-100 mt-2"
        iconNode={<XCircleIcon weight="bold" />}
        label={
          usesCallVocabulary()
            ? translate('Decline award')
            : translate('Decline')
        }
        size="lg"
      />
    </>
  );
};
