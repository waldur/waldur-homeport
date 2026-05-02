import { rancherNodesPull } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

export const PullNodeAction: ActionItemType = ({ resource, refetch }) => {
  const user = useUser();
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
