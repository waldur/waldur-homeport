import { CheckIcon, XIcon } from '@phosphor-icons/react';
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
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

interface SuggestionRowActionsProps {
  row: ReviewerSuggestion;
  fetch: () => void;
}

const SuggestionRejectDialog = lazyComponent(() =>
  import('./SuggestionRejectDialog').then((m) => ({
    default: m.SuggestionRejectDialog,
  })),
);

export const SuggestionRowActions: FC<SuggestionRowActionsProps> = ({
  row,
  fetch,
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

  // Show confirm/reject actions for pending suggestions
  if (row.status === 'pending') {
    return (
      <ActionsDropdownComponent>
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
        <ActionItem
          title={translate('Reject')}
          action={handleReject}
          iconNode={<XIcon weight="bold" />}
          iconColor="danger"
          className="text-danger"
          disabled={isLoading}
        />
        <RemovalActionItem
          title={
            deleteMutation.isPending
              ? translate('Deleting...')
              : translate('Delete')
          }
          action={() => deleteMutation.mutate()}
          disabled={isLoading}
        />
      </ActionsDropdownComponent>
    );
  }

  // For non-pending statuses, only show delete
  return (
    <ActionsDropdownComponent>
      <RemovalActionItem
        title={
          deleteMutation.isPending
            ? translate('Deleting...')
            : translate('Delete')
        }
        action={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
      />
    </ActionsDropdownComponent>
  );
};
