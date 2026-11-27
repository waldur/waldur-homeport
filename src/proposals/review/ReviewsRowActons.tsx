import { useCurrentStateAndParams } from '@uirouter/react';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import {
  ArchivedCallContext,
  isRowOfArchivedCall,
  useArchivedCallReason,
} from '../archivedCall';

import { ReviewDeleteAction } from './ReviewDeleteAction';
import { ReviewViewAction } from './ReviewViewAction';

export const ReviewsRowActions = ({ row, fetch }) => {
  const { state } = useCurrentStateAndParams();

  const user = useUser();
  // Known from the page, or from the row on lists across calls.
  const archived = Boolean(useArchivedCallReason()) || isRowOfArchivedCall(row);
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
    // An archived call's reviews are not removed (ReviewDeleteAction).
    <ArchivedCallContext.Provider value={archived}>
      <ActionsDropdown
        row={row}
        refetch={fetch}
        actions={[ReviewViewAction, canDelete && ReviewDeleteAction].filter(
          Boolean,
        )}
      />
    </ArchivedCallContext.Provider>
  );
};
