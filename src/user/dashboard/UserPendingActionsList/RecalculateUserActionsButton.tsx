import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { userActionsUpdateActions } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const RecalculateUserActionsButton: FC<{ refetch?: () => void }> = ({
  refetch,
}) => {
  const currentUser = useUser();

  const recalculateMutation = useManagedMutation<any, any, void>({
    mutationFn: () => userActionsUpdateActions(),
    successMessage: translate(
      'User actions have been recalculated successfully.',
    ),
    errorMessage: translate('Unable to recalculate user actions.'),
    refetch,
  });

  if (!currentUser?.is_staff) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Recalculate user actions')}
      action={() => recalculateMutation.mutate()}
      disabled={recalculateMutation.isPending}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
