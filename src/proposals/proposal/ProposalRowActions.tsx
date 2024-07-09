import { useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

import { forceApproveProposal, rejectProposal } from '../api';

const CreateReviewDialog = lazyComponent(
  () => import('./create-review/CreateReviewDialog'),
  'CreateReviewDialog',
);

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
        <Dropdown.Item onClick={() => openCreateReviewDialog(row)}>
          {translate('Create review')}
        </Dropdown.Item>
      )}
      <Dropdown.Item
        as={Link}
        state="call-management.proposal-details"
        params={{ proposal_uuid: row.uuid }}
      >
        {translate('View')}
      </Dropdown.Item>
      {!isRejectButtonDisabled && (
        <>
          <Dropdown.Item
            onClick={() => handleRejectProposal(row.uuid)}
            className={
              'text-danger' + (isRejectButtonDisabled ? ' opacity-50' : '')
            }
            disabled={isRejectButtonDisabled}
          >
            {translate('Reject')}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => handleForceApproveProposal(row.uuid)}
            className={
              'text-danger' + (isRejectButtonDisabled ? ' opacity-50' : '')
            }
            disabled={isRejectButtonDisabled}
          >
            {translate('Force approve')}
          </Dropdown.Item>
        </>
      )}
    </ActionsDropdownComponent>
  );
};
