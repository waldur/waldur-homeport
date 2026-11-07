import { useCurrentStateAndParams } from '@uirouter/react';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { ReviewDeleteAction } from './ReviewDeleteAction';
import { ReviewViewAction } from './ReviewViewAction';

export const ReviewsRowActions = ({ row, fetch }) => {
  const { state } = useCurrentStateAndParams();

  const user = useUser();
  const canDelete = hasPermission(user, {
    permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
    scopeId: row.call_uuid,
    callOrganizerId: row.call_managing_organisation_uuid,
  });
  // A reviewer's own list offers every review: one in progress to continue,
  // one submitted or sent back to read.
  const showActions =
    canDelete ||
    state.name === 'call-management.review-list' ||
    state.parent === 'reviews' ||
    row.state === 'in_review';
  if (!showActions) {
    return <ActionsDropdown disabled tooltip />;
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
