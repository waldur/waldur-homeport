import { PlayIcon } from '@phosphor-icons/react';
import { adminArrowBillingSyncsResumeSync } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

import { arrowQueryKeys } from '../api';

interface ArrowSettingsResumeSyncActionProps {
  refetch: () => void;
}

export const ArrowSettingsResumeSyncAction = ({
  refetch,
}: ArrowSettingsResumeSyncActionProps) => {
  const { mutate: handleResumeSync, isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => adminArrowBillingSyncsResumeSync(),
    invalidateQueries: [{ queryKey: arrowQueryKeys.settings() }],
    refetch,
    successMessage: translate('Sync resumed'),
    errorMessage: translate('Failed to resume sync'),
  });

  return (
    <ActionButton
      action={handleResumeSync}
      title={translate('Resume sync')}
      iconNode={<PlayIcon weight="bold" />}
      variant="secondary"
      pending={isPending}
    />
  );
};
