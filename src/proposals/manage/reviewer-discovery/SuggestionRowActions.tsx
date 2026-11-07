import { CheckIcon, UserIcon, XIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import {
  reviewerSuggestionsConfirm,
  reviewerSuggestionsDestroy,
  ReviewerSuggestion,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';

/**
 * A suggestion still to decide: pending, and its reviewer not in the call's
 * pool already -- someone invited directly has nothing left to confirm.
 */
export const isOpenSuggestion = (row: ReviewerSuggestion) =>
  row.status === 'pending' && !row.pool_invitation_status;

interface SuggestionRowActionsProps {
  row: ReviewerSuggestion;
  fetch: () => void;
  /** Confirm, reject and delete; without it the menu only views the profile. */
  canManage?: boolean;
}

const ReviewerProfileDialog = lazyComponent(() =>
  import('./ReviewerProfileDialog').then((m) => ({
    default: m.ReviewerProfileDialog,
  })),
);

const SuggestionRejectDialog = lazyComponent(() =>
  import('./SuggestionRejectDialog').then((m) => ({
    default: m.SuggestionRejectDialog,
  })),
);

export const SuggestionRowActions: FC<SuggestionRowActionsProps> = ({
  row,
  fetch,
  canManage = true,
}) => {
  const { openDialog } = useModal();

  const confirmMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      reviewerSuggestionsConfirm({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Confirmed suggestion for {name}.', {
      name: row.reviewer_name,
    }),
    errorMessage: translate('Unable to confirm suggestion.'),
    refetch: fetch,
  });

  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      reviewerSuggestionsDestroy({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Deleted suggestion for {name}.', {
      name: row.reviewer_name,
    }),
    errorMessage: translate('Unable to delete suggestion.'),
    refetch: fetch,
  });

  const handleReject = useCallback(() => {
    openDialog(SuggestionRejectDialog, {
      resolve: { suggestion: row, refetch: fetch },
      size: 'sm',
    });
  }, [row, fetch]);

  const isLoading = confirmMutation.isPending || deleteMutation.isPending;

  const open = isOpenSuggestion(row);
  return (
    <ActionsMenu>
      <ActionItem
        title={translate('View profile')}
        action={() =>
          openDialog(ReviewerProfileDialog, {
            resolve: { suggestion: row },
            size: 'lg',
          })
        }
        iconNode={<UserIcon weight="bold" />}
      />
      {/* Confirm and reject for a suggestion still to decide. */}
      {canManage && open && (
        <ActionItem
          title={
            confirmMutation.isPending
              ? translate('Confirming...')
              : translate('Confirm')
          }
          action={() => confirmMutation.mutate()}
          iconNode={<CheckIcon weight="bold" />}
          iconColor="success"
          className="text-success"
          disabled={isLoading}
        />
      )}
      {canManage && open && (
        <ActionItem
          title={translate('Reject')}
          action={handleReject}
          iconNode={<XIcon weight="bold" />}
          iconColor="danger"
          className="text-danger"
          disabled={isLoading}
        />
      )}
      {canManage && (
        <RemovalActionItem
          title={
            deleteMutation.isPending
              ? translate('Deleting...')
              : translate('Delete')
          }
          action={() => deleteMutation.mutate()}
          disabled={isLoading}
        />
      )}
    </ActionsMenu>
  );
};
