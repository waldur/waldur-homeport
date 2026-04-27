import { marketplaceRobotAccountsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ResourceDeleteButton } from '@/resource/actions/ResourceDeleteButton';
import { useUser } from '@/workspace/hooks';

export const RobotAccountDeleteButton = ({ row, refetch }) => {
  const user = useUser();
  if (
    !hasPermission(user, {
      permission: PermissionEnum.DELETE_RESOURCE_ROBOT_ACCOUNT,
      customerId: row.provider_uuid,
    })
  ) {
    return null;
  }
  return (
    <ResourceDeleteButton
      apiFunction={() =>
        marketplaceRobotAccountsDestroy({ path: { uuid: row.uuid } })
      }
      resourceType={translate('robot account')}
      refetch={refetch}
    />
  );
};
