import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { usersScimSyncAll } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

export const ScimSyncButton = () => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => usersScimSyncAll(),
    successMessage: translate('SCIM user synchronization has been scheduled.'),
    errorMessage: translate('Unable to schedule SCIM user synchronization.'),
  });

  return (
    <ActionButton
      action={mutate}
      variant="primary"
      pending={isPending}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      title={translate('Sync all users')}
    />
  );
};
