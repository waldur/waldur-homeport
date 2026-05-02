import { XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

import { useRejectPermissionRequest } from './useUserPermissionRequestActions';

interface UserPermissionRequestRejectButtonProps {
  row: any;
  refetch;
}

export const UserPermissionRequestRejectButton: FunctionComponent<
  UserPermissionRequestRejectButtonProps
> = ({ row: permissionRequest, refetch }) => {
  const { rejectRequest } = useRejectPermissionRequest(
    permissionRequest,
    refetch,
    { confirm: true },
  );

  return (
    <ActionItem
      action={() => rejectRequest()}
      title={translate('Decline')}
      iconNode={<XCircleIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
