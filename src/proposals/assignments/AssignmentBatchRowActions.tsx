import {
  CalendarPlusIcon,
  EnvelopeSimpleIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  assignmentBatchesSend,
  assignmentBatchesCancel,
  AssignmentBatchList,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog, waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/hooks';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

const ExtendDeadlineDialog = lazyComponent(() =>
  import('./ExtendDeadlineDialog').then((m) => ({
    default: m.ExtendDeadlineDialog,
  })),
);

interface AssignmentBatchRowActionsProps {
  row: AssignmentBatchList;
  refetch: () => void;
}

export const AssignmentBatchRowActions: FC<AssignmentBatchRowActionsProps> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();

  const sendMutation = useMutation({
    mutationFn: () =>
      assignmentBatchesSend({
        path: { uuid: row.uuid },
        body: {},
      }),
    onSuccess: () => {
      showSuccess(translate('Assignment batch sent successfully.'));
      refetch();
    },
    onError: (error) => {
      showErrorResponse(error, translate('Failed to send assignment batch.'));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      assignmentBatchesCancel({
        path: { uuid: row.uuid },
      }),
    onSuccess: () => {
      showSuccess(translate('Assignment batch cancelled.'));
      refetch();
    },
    onError: (error) => {
      showErrorResponse(error, translate('Failed to cancel assignment batch.'));
    },
  });

  const handleSend = useCallback(() => {
    sendMutation.mutate();
  }, [sendMutation]);

  const handleCancel = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Cancel assignment batch'),
        translate(
          'Are you sure you want to cancel this assignment batch for {reviewer}?',
          { reviewer: row.reviewer_name || row.reviewer_email },
        ),
      );
      cancelMutation.mutate();
    } catch {
      // User cancelled confirmation
    }
  }, [dispatch, row, cancelMutation]);

  const handleExtendDeadline = useCallback(() => {
    dispatch(
      openModalDialog(ExtendDeadlineDialog, {
        resolve: { batch: row, refetch },
      }),
    );
  }, [dispatch, row, refetch]);

  const canSend = row.status === 'draft';
  const canCancel = row.status === 'draft' || row.status === 'sent';
  const canExtendDeadline = row.status === 'sent' || row.status === 'expired';

  if (!canSend && !canCancel && !canExtendDeadline) {
    return null;
  }

  return (
    <ActionsDropdownComponent>
      {canSend && (
        <ActionItem
          title={translate('Send')}
          action={handleSend}
          iconNode={<EnvelopeSimpleIcon weight="bold" />}
          disabled={sendMutation.isPending}
        />
      )}
      {canExtendDeadline && (
        <ActionItem
          title={translate('Extend deadline')}
          action={handleExtendDeadline}
          iconNode={<CalendarPlusIcon weight="bold" />}
        />
      )}
      {canCancel && (
        <ActionItem
          title={translate('Cancel')}
          action={handleCancel}
          iconNode={<XIcon weight="bold" />}
          className="text-danger"
          iconColor="danger"
          disabled={cancelMutation.isPending}
        />
      )}
    </ActionsDropdownComponent>
  );
};
