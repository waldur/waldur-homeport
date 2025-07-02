import { useSelector } from 'react-redux';
import { rancherClustersPull } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

export const PullClusterAction: ActionItemType = ({ resource }) => {
  const user = useSelector(getUser);
  if (user.is_staff || !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE)
    return (
      <PullActionItem
        apiMethod={(uuid) => rancherClustersPull({ path: { uuid } })}
        resource={resource}
        staff={ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE}
      />
    );

  return null;
};
