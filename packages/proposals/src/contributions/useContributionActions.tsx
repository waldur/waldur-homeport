import { translate } from 'waldur-i18n-runtime';
import {
  proposalProposalsAcceptContribution,
  proposalProposalsDeclineContribution,
  proposalProposalsDelegateContribution,
  StepContribution,
} from 'waldur-js-client';
import { useManagedMutation } from 'waldur-shell';

import { CoiDeclaration } from '../CoiDeclaration';
import { ProposalRef } from '../types';
import { proposalWorkflowStatesKey } from '../workflow/queries';

import { proposalContributionsKey } from './queries';

/**
 * Accepting, declining and taking back a handed-on contribution, in place.
 * Accepting confirms there is no conflict of interest, in the step's or the
 * call's own words where it has them.
 */
export const useContributionActions = (
  proposal: ProposalRef,
  contribution: StepContribution,
  refetch?: () => void,
) => {
  const invalidateQueries = [
    { queryKey: proposalContributionsKey(proposal.uuid) },
    { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
  ];
  const path = { uuid: proposal.uuid };
  const accept = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      proposalProposalsAcceptContribution({
        path,
        body: {
          contribution_uuid: contribution.uuid,
          confirm_no_conflict: true,
        },
      }),
    confirmation: {
      title: translate('Accept the contribution'),
      body: contribution.coi_declaration_text ? (
        <>
          <p>{translate('You take this contribution over and fill it in.')}</p>
          <CoiDeclaration
            text={contribution.coi_declaration_text}
            fallback={null}
          />
        </>
      ) : (
        translate(
          'You take this contribution over and fill it in. You confirm that you have no conflict of interest with the proposal.',
        )
      ),
    },
    successMessage: translate('The contribution is yours to fill in.'),
    errorMessage: translate('Unable to accept the contribution.'),
    closeModal: false,
    refetch,
    invalidateQueries,
  });
  const decline = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      proposalProposalsDeclineContribution({
        path,
        body: { contribution_uuid: contribution.uuid },
      }),
    confirmation: {
      title: translate('Decline the contribution'),
      body: translate(
        'The contribution goes back to whoever handed it to you, who is told.',
      ),
    },
    successMessage: translate('The contribution is handed back.'),
    errorMessage: translate('Unable to decline the contribution.'),
    closeModal: false,
    refetch,
    invalidateQueries,
  });
  const takeBack = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      proposalProposalsDelegateContribution({
        path,
        body: { contribution_uuid: contribution.uuid, user_uuid: null },
      }),
    confirmation: {
      title: translate('Take the contribution back'),
      body: translate(
        'The person it is handed to can no longer fill it in, and is told. What they wrote stays.',
      ),
    },
    successMessage: translate('The contribution is taken back.'),
    errorMessage: translate('Unable to take the contribution back.'),
    closeModal: false,
    refetch,
    invalidateQueries,
  });
  return { accept, decline, takeBack };
};
