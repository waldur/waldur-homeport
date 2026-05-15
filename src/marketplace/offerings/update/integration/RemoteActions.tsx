import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';
import {
  isOwner as isOwnerSelector,
  isServiceManagerSelector,
} from '@/workspace/selectors';

import { PullRemoteOfferingDetailsAction } from './PullRemoteOfferingDetailsAction';
import { PullRemoteOfferingInvoicesAction } from './PullRemoteOfferingInvoicesAction';
import { PullRemoteOfferingOrdersAction } from './PullRemoteOfferingOrdersAction';
import { PullRemoteOfferingResourcesAction } from './PullRemoteOfferingResourcesAction';
import { PullRemoteOfferingRobotAccountsAction } from './PullRemoteOfferingRobotAccountsAction';
import { PullRemoteOfferingUsageAction } from './PullRemoteOfferingUsageAction';
import { PullRemoteOfferingUsersAction } from './PullRemoteOfferingUsersAction';
import { PushRemoteOfferingProjectDataAction } from './PushRemoteOfferingProjectDataAction';

interface RemoteActionsProps {
  offering: any;
}

export const RemoteActions: FC<RemoteActionsProps> = ({ offering }) => {
  const user = useUser();
  const isOwner = useSelector(isOwnerSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);

  const isVisible =
    offering.type === REMOTE_OFFERING_TYPE &&
    (user?.is_staff || isOwner || isServiceManager);

  if (!isVisible) {
    return null;
  }

  return (
    <ActionsDropdownComponent
      label={translate('Remote actions')}
      labeled
      variant="tertiary"
    >
      <PullRemoteOfferingDetailsAction offering={offering} />
      <PullRemoteOfferingUsersAction offering={offering} />
      <PullRemoteOfferingUsageAction offering={offering} />
      <PullRemoteOfferingResourcesAction offering={offering} />
      <PullRemoteOfferingOrdersAction offering={offering} />
      <PullRemoteOfferingInvoicesAction offering={offering} />
      <PushRemoteOfferingProjectDataAction offering={offering} />
      <PullRemoteOfferingRobotAccountsAction offering={offering} />
    </ActionsDropdownComponent>
  );
};
