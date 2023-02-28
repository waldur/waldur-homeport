import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

import { pullCluster } from '../../api';

export const PullClusterAction: ActionItemType = ({ resource }) => {
  const user = useSelector(getUser);
  if (user.is_staff || !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE)
    return (
      <PullActionItem
        apiMethod={pullCluster}
        resource={resource}
        staff={ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE}
      />
    );
  return null;
};
