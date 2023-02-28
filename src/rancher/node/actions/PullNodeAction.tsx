import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

import { pullNode } from '../../api';

export const PullNodeAction: ActionItemType = ({ resource, refetch }) => {
  const user = useSelector(getUser);
  if (user.is_staff || !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE)
    return (
      <PullActionItem
        apiMethod={pullNode}
        resource={resource}
        refetch={refetch}
        staff={ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE}
      />
    );
  return null;
};
