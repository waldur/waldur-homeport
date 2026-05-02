import { CheckCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

import { useApprovePermissionRequest } from './useUserPermissionRequestActions';

interface UserPermissionRequestApproveButtonProps {
  row: any;
  refetch;
}

export const UserPermissionRequestApproveButton: FunctionComponent<
  UserPermissionRequestApproveButtonProps
> = ({ row: permissionRequest, refetch }) => {
  const { approveRequest } = useApprovePermissionRequest(
    permissionRequest,
    refetch,
    { confirm: true },
  );

  return (
    <ActionItem
      action={() => approveRequest()}
      title={translate('Approve')}
      iconNode={<CheckCircleIcon weight="bold" />}
    />
  );
};
