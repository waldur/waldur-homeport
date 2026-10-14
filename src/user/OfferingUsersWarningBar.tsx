import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { LayoutWarningBar } from '@/navigation/LayoutWarningBar';
import { router } from '@/router';

import { usePendingOfferingUsers } from './hooks/usePendingOfferingUsers';

export const OfferingUsersWarningBar: FC = () => {
  const { state } = useCurrentStateAndParams();
  const { data: pendingUsers, isLoading } = usePendingOfferingUsers();

  const isProfileRoute = state.name?.startsWith('profile');

  if (
    !isProfileRoute ||
    isLoading ||
    !pendingUsers ||
    pendingUsers.length === 0
  ) {
    return null;
  }

  const count = pendingUsers.length;

  const handleViewAccounts = () => {
    router.stateService.go('profile-remote-accounts', {
      filterAttention: true,
    });
  };

  return (
    <LayoutWarningBar
      title={translate('Action required for some accounts.')}
      actions={
        <BaseButton
          variant="tertiary"
          onClick={handleViewAccounts}
          label={translate('View accounts')}
          size="sm"
        />
      }
    >
      {translate(
        'You have {count} accounts that require attention to complete setup.',
        { count },
      )}
    </LayoutWarningBar>
  );
};
