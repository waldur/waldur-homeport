import { translate } from '@waldur/i18n';
import { deleteRobotAccount } from '@waldur/marketplace/common/api';
import { ResourceDeleteButton } from '@waldur/resource/actions/ResourceDeleteButton';

export const RobotAccountDeleteButton = ({ row, refetch }) => (
  <ResourceDeleteButton
    apiFunction={() => deleteRobotAccount(row.uuid)}
    resourceType={translate('robot account')}
    refetch={refetch}
  />
);
