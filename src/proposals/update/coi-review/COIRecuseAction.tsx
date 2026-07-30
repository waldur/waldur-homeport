import { UserMinusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  ConflictOfInterest,
  conflictsOfInterestRecuse,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { COIConfirmationBody } from './COIConfirmationBody';

interface COIRecuseActionProps {
  row: ConflictOfInterest;
  fetch: () => void;
}

export const COIRecuseAction: FC<COIRecuseActionProps> = ({ row, fetch }) => {
  const { mutate: handleRecuse, isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      conflictsOfInterestRecuse({
        path: { uuid: row.uuid },
        body: { status: 'recused' },
      }),
    successMessage: translate('Reviewer recused from proposal.'),
    errorMessage: translate('Failed to recuse reviewer.'),
    refetch: fetch,
    confirmation: {
      title: translate('Recuse reviewer'),
      body: (
        <COIConfirmationBody
          intro={translate(
            'You are about to remove this reviewer from reviewing the proposal.',
          )}
          consequences={[
            translate(
              'The reviewer will be permanently removed from this proposal.',
            ),
            translate(
              'Any existing review or scores from this reviewer will be discarded.',
            ),
            translate(
              'You may need to assign a replacement reviewer to maintain review coverage.',
            ),
          ]}
          row={row}
        />
      ),
      options: {
        positiveButton: translate('Recuse reviewer'),
        negativeButton: translate('Cancel'),
        positiveButtonVariant: 'danger',
        bodyClassName: 'pt-0',
        type: 'danger',
      },
    },
  });

  return (
    <ActionItem
      title={isPending ? translate('Recusing...') : translate('Recuse')}
      action={() => handleRecuse()}
      iconNode={<UserMinusIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={isPending}
    />
  );
};
