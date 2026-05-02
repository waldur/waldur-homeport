import {
  CalendarPlusIcon,
  EnvelopeSimpleIcon,
  XIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import {
  assignmentBatchesSend,
  assignmentBatchesCancel,
  AssignmentBatchList,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
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
  const { openDialog } = useModal();

  const { mutate: handleSend, isPending: isSending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => assignmentBatchesSend({ path: { uuid: row.uuid } }),
    successMessage: translate('Assignment batch sent successfully.'),
    errorMessage: translate('Failed to send assignment batch.'),
    refetch,
  });

  const { mutate: handleCancel, isPending: isCancelling } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => assignmentBatchesCancel({ path: { uuid: row.uuid } }),
    successMessage: translate('Assignment batch cancelled.'),
    errorMessage: translate('Failed to cancel assignment batch.'),
    refetch,
    confirmation: {
      title: translate('Cancel assignment batch'),
      body: translate(
        'Are you sure you want to cancel this assignment batch for {reviewer}?',
        { reviewer: row.reviewer_name || row.reviewer_email },
      ),
    },
  });

  const handleExtendDeadline = useCallback(() => {
    openDialog(ExtendDeadlineDialog, {
      resolve: { batch: row, refetch },
    });
  }, [row, refetch]);

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
          action={() => handleSend()}
          iconNode={<EnvelopeSimpleIcon weight="bold" />}
          disabled={isSending}
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
          action={() => handleCancel()}
          iconNode={<XIcon weight="bold" />}
          className="text-danger"
          iconColor="danger"
          disabled={isCancelling}
        />
      )}
    </ActionsDropdownComponent>
  );
};
