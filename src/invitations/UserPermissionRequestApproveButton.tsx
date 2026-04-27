import { CheckCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

import { useUserPermissionRequestActions } from './useUserPermissionRequestActions';

interface UserPermissionRequestApproveButtonProps {
  row: any;
  refetch;
}

export const UserPermissionRequestApproveButton: FunctionComponent<
  UserPermissionRequestApproveButtonProps
> = ({ row: permissionRequest, refetch }) => {
  const { approveRequest } = useUserPermissionRequestActions(
    permissionRequest,
    refetch,
  );

  return (
    <ActionItem
      action={() => approveRequest(null, true)}
      title={translate('Approve')}
      iconNode={<CheckCircleIcon weight="bold" />}
    />
  );
};
