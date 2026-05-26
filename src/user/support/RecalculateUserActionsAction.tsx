import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { usersUpdateActions } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface RecalculateUserActionsActionProps {
  userUuid: string;
  refetch: () => void;
}

export const RecalculateUserActionsAction: FC<
  RecalculateUserActionsActionProps
> = ({ userUuid, refetch }) => {
  const { mutate: handleRecalculate, isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => usersUpdateActions({ path: { uuid: userUuid } }),
    successMessage: translate('User actions recalculation has been scheduled.'),
    errorMessage: translate('Unable to recalculate user actions.'),
    refetch,
  });

  return (
    <ActionItem
      title={translate('Recalculate')}
      action={() => handleRecalculate()}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
