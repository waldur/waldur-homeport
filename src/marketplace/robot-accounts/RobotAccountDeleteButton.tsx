import { marketplaceRobotAccountsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ResourceDeleteButton } from '@waldur/resource/actions/ResourceDeleteButton';
import { useUser } from '@waldur/workspace/hooks';

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
