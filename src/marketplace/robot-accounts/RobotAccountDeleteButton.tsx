import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { deleteRobotAccount } from '@waldur/marketplace/common/api';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ResourceDeleteButton } from '@waldur/resource/actions/ResourceDeleteButton';
import { getUser } from '@waldur/workspace/selectors';

export const RobotAccountDeleteButton = ({ row, refetch }) => {
  const user = useSelector(getUser);
  if (
    !hasPermission(user, {
      permission: PermissionEnum.DELETE_RESOURCE_ROBOT_ACCOUNT,
      customerId: row.offering_customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <ResourceDeleteButton
      apiFunction={() => deleteRobotAccount(row.uuid)}
      resourceType={translate('robot account')}
      refetch={refetch}
    />
  );
};
