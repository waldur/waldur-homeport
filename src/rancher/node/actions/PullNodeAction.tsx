import { useSelector } from 'react-redux';
import { rancherNodesPull } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { getUser } from '@/workspace/selectors';

export const PullNodeAction: ActionItemType = ({ resource, refetch }) => {
  const user = useSelector(getUser);
  if (user.is_staff || !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE)
    return (
      <PullActionItem
        apiMethod={(uuid) => rancherNodesPull({ path: { uuid } })}
        resource={resource}
        refetch={refetch}
        staff={ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE}
      />
    );

  return null;
};
