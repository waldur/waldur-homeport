import { WarningCircleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { FeaturedIcon } from '@/core/FeaturedIcon';
import { translate } from '@/i18n';
import { PROVIDER_OFFERING_USERS_FORM_ID } from '@/marketplace/service-providers/constants';
import { router } from '@/router';
import { CompactActionButton } from '@/table/CompactActionButton';

import { usePendingOfferingUsers } from './hooks/usePendingOfferingUsers';

export const OfferingUsersWarningBar: FC = () => {
  const { state } = useCurrentStateAndParams();
  const { data: pendingUsers, isLoading } = usePendingOfferingUsers();
  const dispatch = useDispatch();

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
    router.stateService.go('profile-remote-accounts').then(() => {
      setTimeout(() => {
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

        dispatch(
          change(PROVIDER_OFFERING_USERS_FORM_ID, 'state', pendingStates),
        );
      }, 100);
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
