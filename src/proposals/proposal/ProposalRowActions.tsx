import { ChatText, Check, Eye, X } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { router } from '@waldur/router';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

import { forceApproveProposal, rejectProposal } from '../api';

const CreateReviewDialog = lazyComponent(
  () => import('./create-review/CreateReviewDialog'),
  'CreateReviewDialog',
);

const linkToProposalDetails = (proposalUuid) =>
  router.stateService.go('call-management.proposal-details', {
    proposal_uuid: proposalUuid,
  });

export const ProposalRowActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  const isRejectButtonDisabled = ![
    'submitted',
    'in_review',
    'in_revision',
  ].includes(row.state);

  const dispatch = useDispatch();

  const openCreateReviewDialog = useCallback(
    (proposal) =>
      dispatch(
        openModalDialog(CreateReviewDialog, {
          resolve: { proposal },
          size: 'md',
        }),
      ),
    [dispatch],
  );

  const handleRejectProposal = async (proposalUuid) => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to reject the proposal: {name}?', {
        name: row.name,
      }),
    );
    try {
      await rejectProposal(proposalUuid);
      dispatch(showSuccess(translate('Proposal has been rejected.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to reject the proposal.')),
      );
    }
  };
  const handleForceApproveProposal = async (proposalUuid) => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to approve the proposal: {name}?', {
        name: row.name,
      }),
    );
    try {
      await forceApproveProposal(proposalUuid);
      dispatch(showSuccess(translate('Proposal has been approved.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to approve the proposal.')),
      );
    }
  };
  return (
    <ActionsDropdownComponent>
      {isStaff && (
        <ActionItem
          title={translate('Create review')}
          action={() => openCreateReviewDialog(row)}
          iconNode={<ChatText />}
        />
      )}
      <ActionItem
        title={translate('View')}
        action={() => linkToProposalDetails(row.uuid)}
        iconNode={<Eye />}
      />
      {!isRejectButtonDisabled && (
        <>
          <ActionItem
            title={translate('Reject')}
            action={() => handleRejectProposal(row.uuid)}
            iconNode={<X />}
            disabled={isRejectButtonDisabled}
            className="text-danger"
          />
          <ActionItem
            title={translate('Force approve')}
            action={() => handleForceApproveProposal(row.uuid)}
            iconNode={<Check />}
            disabled={isRejectButtonDisabled}
            className="text-danger"
          />
        </>
      )}
    </ActionsDropdownComponent>
  );
};
