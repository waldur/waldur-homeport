import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { ReviewDeleteAction } from './ReviewDeleteAction';
import { ReviewViewAction } from './ReviewViewAction';

export const ReviewsRowActions = ({ row, fetch }) => {
  const { state } = useCurrentStateAndParams();

  const user = useSelector(getUser);
  const canDelete = hasPermission(user, {
    permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
    scopeId: row.call_uuid,
    callOrganizerId: row.call_managing_organisation_uuid,
  });
  const showActions =
    canDelete ||
    state.name === 'call-management.review-list' ||
    row.state === 'in_review';
  if (!showActions) {
    return 'N/A';
  }

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[ReviewViewAction, canDelete && ReviewDeleteAction].filter(
        Boolean,
      )}
    />
  );
};
