import {
  ChatTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { useProposalDecisionActions } from './create/utils';

const CreateReviewDialog = lazyComponent(() =>
  import('./create-review/CreateReviewDialog').then((module) => ({
    default: module.CreateReviewDialog,
  })),
);

export const ProposalRowActions = ({ row, refetch }) => {
  const user = useSelector(getUser);
  const canCreateReview = hasPermission(user, {
    permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
    scopeId: row.call_uuid,
  });

  const dispatch = useDispatch();

  const openCreateReviewDialog = useCallback(
    (proposal) =>
      dispatch(
        openModalDialog(CreateReviewDialog, {
          resolve: { proposal },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  const {
    canPerformDecisionActions,
    handleApproveProposal,
    handleRejectProposal,
  } = useProposalDecisionActions(row, refetch);

  return (
    <ActionsDropdownComponent>
      {canCreateReview && (
        <ActionItem
          title={translate('Create review')}
          action={() => openCreateReviewDialog(row)}
          iconNode={<ChatTextIcon weight="bold" />}
        />
      )}
      {canPerformDecisionActions && (
        <>
          <ActionItem
            title={translate('Approve')}
            action={handleApproveProposal}
            iconNode={<CheckCircleIcon weight="bold" />}
            disabled={!canPerformDecisionActions}
          />

          <ActionItem
            title={translate('Reject')}
            action={handleRejectProposal}
            iconNode={<XCircleIcon weight="bold" />}
            disabled={!canPerformDecisionActions}
            className="text-danger"
            iconColor="danger"
          />
        </>
      )}
    </ActionsDropdownComponent>
  );
};
