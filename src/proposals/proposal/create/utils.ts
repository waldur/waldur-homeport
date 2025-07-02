import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Proposal,
  proposalProposalsApprove,
  proposalProposalsReject,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

export const useProposalDecisionActions = (
  proposal: Proposal,
  refetch: () => void,
) => {
  const dispatch = useDispatch();
  const user = useUser();

  const stateIsValid = ['submitted', 'in_review'].includes(proposal.state);

  const hasPermissionForDecision = hasPermission(user, {
    permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
    scopeId: proposal.call_uuid,
  });

  const canPerformDecisionActions = stateIsValid && hasPermissionForDecision;

  const handleApproveProposal = useCallback(async () => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate(
        'Are you sure you want to approve the proposal {name} in state {state}?',
        {
          name: proposal.name,
          state: proposal.state,
        },
      ),
    );
    try {
      await proposalProposalsApprove({ path: { uuid: proposal.uuid } });
      dispatch(showSuccess(translate('Proposal has been approved.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to approve the proposal.')),
      );
    }
  }, [dispatch, proposal.uuid, proposal.name, proposal.state, refetch]);

  const handleRejectProposal = useCallback(async () => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to reject the proposal: {name}?', {
        name: proposal.name,
      }),
    );
    try {
      await proposalProposalsReject({ path: { uuid: proposal.uuid } });
      dispatch(showSuccess(translate('Proposal has been rejected.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to reject the proposal.')),
      );
    }
  }, [dispatch, proposal.uuid, proposal.name, refetch]);

  return {
    canPerformDecisionActions,
    handleApproveProposal,
    handleRejectProposal,
  };
};
