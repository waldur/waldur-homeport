import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  ConflictOfInterest,
  conflictsOfInterestDismiss,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { COIConfirmationBody } from './COIConfirmationBody';

interface COIDismissActionProps {
  row: ConflictOfInterest;
  fetch: () => void;
}

export const COIDismissAction: FC<COIDismissActionProps> = ({ row, fetch }) => {
  const { mutate: handleDismiss, isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      conflictsOfInterestDismiss({
        path: { uuid: row.uuid },
        body: { status: 'dismissed' },
      }),
    successMessage: translate('Conflict of interest dismissed.'),
    errorMessage: translate('Failed to dismiss conflict.'),
    refetch: fetch,
    confirmation: {
      title: translate('Dismiss conflict of interest'),
      body: (
        <COIConfirmationBody
          intro={translate(
            'You are about to dismiss this detected conflict of interest.',
          )}
          consequences={[
            translate(
              'The conflict will be marked as a false positive and removed from active review.',
            ),
            translate(
              'The reviewer can continue reviewing this proposal without restrictions.',
            ),
            translate('This decision will be logged for audit purposes.'),
          ]}
          row={row}
        />
      ),
      options: {
        positiveButton: translate('Dismiss conflict'),
        negativeButton: translate('Cancel'),
        positiveButtonVariant: 'primary',
        hideIcon: true,
        bodyClassName: 'pt-0',
      },
    },
  });

  return (
    <ActionItem
      title={isPending ? translate('Dismissing...') : translate('Dismiss')}
      action={() => handleDismiss()}
      iconNode={<XIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
