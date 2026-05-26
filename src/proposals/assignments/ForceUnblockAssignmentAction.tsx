import { ShieldWarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { assignmentItemsForceUnblock } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface ForceUnblockAssignmentActionProps {
  item: { uuid: string; proposal_name?: string };
  refetchBatch: () => void;
}

export const ForceUnblockAssignmentAction: FC<
  ForceUnblockAssignmentActionProps
> = ({ item, refetchBatch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, any>({
    mutationFn: (result) =>
      assignmentItemsForceUnblock({
        path: { uuid: item.uuid },
        body: { override_reason: result?.input || '' },
      }),
    confirmation: {
      title: translate('Force unblock assignment'),
      body: translate(
        'This assignment item is blocked due to a conflict of interest. Forcing an unblock will allow the reviewer to proceed with reviewing the proposal "{proposal}". A reason is required for audit purposes.',
        { proposal: item.proposal_name || '' },
      ),
      options: {
        showInput: true,
        inputLabel: translate('Override reason'),
        inputRequired: true,
        positiveButton: translate('Force unblock'),
        positiveButtonVariant: 'warning',
        size: 'lg',
      },
    },
    refetch: refetchBatch,
    successMessage: translate('Assignment item unblocked.'),
    errorMessage: translate('Failed to unblock assignment item.'),
  });

  return (
    <ActionItem
      title={translate('Force unblock')}
      action={mutate}
      iconNode={<ShieldWarningIcon weight="bold" />}
      iconColor="warning"
      className="text-warning"
      disabled={isPending}
    />
  );
};
