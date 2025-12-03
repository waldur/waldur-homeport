import { WarningCircleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';
import { PROVIDER_OFFERING_USERS_FORM_ID } from '@waldur/marketplace/service-providers/constants';
import { router } from '@waldur/router';

import { usePendingOfferingUsers } from './hooks/usePendingOfferingUsers';

import './OfferingUsersWarningBar.scss';

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
    <div className="offering-users-warning-bar">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
            <FeaturedIcon
              IconComponent={WarningCircleIcon}
              variant="warning"
              size="sm"
            />
            <span className="ms-2">
              <strong>{translate('Action required for some accounts.')}</strong>{' '}
              {translate(
                'You have {count} accounts that require attention to complete setup.',
                { count },
              )}
            </span>
          </div>
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleViewAccounts}
            className="ms-3"
          >
            {translate('View accounts')}
          </Button>
        </div>
      </div>
    </div>
  );
};
