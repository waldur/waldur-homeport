import { PauseIcon } from '@phosphor-icons/react';
import { adminArrowBillingSyncsPauseSync } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

import { arrowQueryKeys } from '../api';

interface ArrowSettingsPauseSyncActionProps {
  refetch: () => void;
}

export const ArrowSettingsPauseSyncAction = ({
  refetch,
}: ArrowSettingsPauseSyncActionProps) => {
  const { mutate: handlePauseSync, isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => adminArrowBillingSyncsPauseSync(),
    invalidateQueries: [{ queryKey: arrowQueryKeys.settings() }],
    refetch,
    successMessage: translate('Sync paused'),
    errorMessage: translate('Failed to pause sync'),
  });

  return (
    <ActionButton
      action={handlePauseSync}
      title={translate('Pause sync')}
      iconNode={<PauseIcon weight="bold" />}
      variant="secondary"
      pending={isPending}
    />
  );
};
