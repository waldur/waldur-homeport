import { Check, Trash, X } from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  reviewerSuggestionsConfirm,
  reviewerSuggestionsDestroy,
  ReviewerSuggestion,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

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
  const dispatch = useDispatch();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsConfirming(true);
    try {
      await reviewerSuggestionsConfirm({
        path: { uuid: row.uuid },
      });
      dispatch(
        showSuccess(
          translate('Confirmed suggestion for {name}.', {
            name: row.reviewer_name,
          }),
        ),
      );
      fetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to confirm suggestion.')),
      );
    } finally {
      setIsConfirming(false);
    }
  }, [row.uuid, row.reviewer_name, dispatch, fetch]);

  const handleReject = useCallback(() => {
    dispatch(
      openModalDialog(SuggestionRejectDialog, {
        resolve: { suggestion: row, refetch: fetch },
        size: 'sm',
      }),
    );
  }, [row, fetch, dispatch]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await reviewerSuggestionsDestroy({
        path: { uuid: row.uuid },
      });
      dispatch(
        showSuccess(
          translate('Deleted suggestion for {name}.', {
            name: row.reviewer_name,
          }),
        ),
      );
      fetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to delete suggestion.')),
      );
    } finally {
      setIsDeleting(false);
    }
  }, [row.uuid, row.reviewer_name, dispatch, fetch]);

  const isLoading = isConfirming || isDeleting;

  // Show confirm/reject actions for pending suggestions
  if (row.status === 'pending') {
    return (
      <ActionsDropdownComponent>
        <ActionItem
          title={
            isConfirming ? translate('Confirming...') : translate('Confirm')
          }
          action={handleConfirm}
          iconNode={<Check weight="bold" />}
          iconColor="success"
          className="text-success"
          disabled={isLoading}
        />
        <ActionItem
          title={translate('Reject')}
          action={handleReject}
          iconNode={<X weight="bold" />}
          iconColor="danger"
          className="text-danger"
          disabled={isLoading}
        />
        <ActionItem
          title={isDeleting ? translate('Deleting...') : translate('Delete')}
          action={handleDelete}
          iconNode={<Trash weight="bold" />}
          disabled={isLoading}
        />
      </ActionsDropdownComponent>
    );
  }

  // For non-pending statuses, only show delete
  return (
    <ActionsDropdownComponent>
      <ActionItem
        title={isDeleting ? translate('Deleting...') : translate('Delete')}
        action={handleDelete}
        iconNode={<Trash weight="bold" />}
        disabled={isDeleting}
      />
    </ActionsDropdownComponent>
  );
};
