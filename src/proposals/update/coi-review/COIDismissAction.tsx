import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  ConflictOfInterest,
  conflictsOfInterestDismiss,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

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
        <div>
          <p>
            {translate(
              'You are about to dismiss this detected conflict of interest.',
            )}
          </p>
          <div className="bg-light-success rounded p-3 mb-3">
            <strong className="d-block mb-2">
              {translate('What happens next:')}
            </strong>
            <ul className="mb-0 ps-3">
              <li>
                {translate(
                  'The conflict will be marked as a false positive and removed from active review.',
                )}
              </li>
              <li>
                {translate(
                  'The reviewer can continue reviewing this proposal without restrictions.',
                )}
              </li>
              <li>
                {translate('This decision will be logged for audit purposes.')}
              </li>
            </ul>
          </div>
          <div className="text-muted small">
            <strong>{translate('Reviewer')}:</strong> {row.reviewer_name}
            <br />
            <strong>{translate('Proposal')}:</strong> {row.proposal_name}
            <br />
            <strong>{translate('Conflict type')}:</strong>{' '}
            {row.coi_type_display}
          </div>
        </div>
      ),
      options: {
        positiveButton: translate('Dismiss conflict'),
        positiveButtonVariant: 'success',
        type: 'success',
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
