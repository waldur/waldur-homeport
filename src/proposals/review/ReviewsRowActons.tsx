import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { ReviewDeleteAction } from './ReviewDeleteAction';
import { ReviewItemAction } from './ReviewItemActions';
import { ReviewViewAction } from './ReviewViewAction';

export const ReviewsRowActions = ({ row, fetch }) => {
  const { state } = useCurrentStateAndParams();

  const user = useSelector(getUser);
  const hasReviewPermission = user.is_staff || row.reviewer_uuid === user.uuid;
  const canDelete = hasPermission(user, {
    permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
    scopeId: row.call_uuid,
  });
  const showActions =
    canDelete ||
    (hasReviewPermission && row.state === 'created') ||
    state.name === 'call-management.review-list' ||
    row.state === 'in_review';
  if (!showActions) {
    return 'N/A';
  }

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        ReviewViewAction,
        hasReviewPermission && ReviewItemAction,
        canDelete && ReviewDeleteAction,
      ].filter(Boolean)}
    />
  );
};
