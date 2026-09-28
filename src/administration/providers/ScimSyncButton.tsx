import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { usersScimSyncAll } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const ScimSyncButton = () => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => usersScimSyncAll(),
    successMessage: translate('SCIM user synchronization has been scheduled.'),
    errorMessage: translate('Unable to schedule SCIM user synchronization.'),
  });

  return (
    <BaseButton
      onClick={mutate}
      variant="primary"
      pending={isPending}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      label={translate('Sync all users')}
      size="lg"
    />
  );
};
