import { WarningCircleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { FeaturedIcon } from '@/core/FeaturedIcon';
import { translate } from '@/i18n';
import { router } from '@/router';
import { CompactActionButton } from '@/table/CompactActionButton';

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
    const pendingStates = [
      {
        value: 'Pending account linking',
        label: translate('Pending account linking'),
      },
      {
        value: 'Pending additional validation',
        label: translate('Pending additional validation'),
      },
    ];
    router.stateService.go('profile-remote-accounts', {
      filterState: pendingStates,
    });
  };

  return (
    <div className="layout-warning-bar bar-warning">
      <div className="container-fluid w-100 d-flex align-items-center gap-2">
        {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
        <FeaturedIcon
          IconComponent={WarningCircleIcon}
          variant="warning"
          size="sm"
        />
        <p className="text-start fs-6 mb-0">
          <strong className="fw-bold">
            {translate('Action required for some accounts.')}
          </strong>{' '}
          {translate(
            'You have {count} accounts that require attention to complete setup.',
            { count },
          )}
        </p>
        <CompactActionButton
          variant="tertiary"
          action={handleViewAccounts}
          className="ms-auto"
          title={translate('View accounts')}
        />
      </div>
    </div>
  );
};
