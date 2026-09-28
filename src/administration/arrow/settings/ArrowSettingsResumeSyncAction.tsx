import { PlayIcon } from '@phosphor-icons/react';
import { adminArrowBillingSyncsResumeSync } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
    <BaseButton
      onClick={handleResumeSync}
      label={translate('Resume sync')}
      iconNode={<PlayIcon weight="bold" />}
      variant="secondary"
      pending={isPending}
      size="lg"
    />
  );
};
