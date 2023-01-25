import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullServerGroup } from '../api';

export const PullServerGroupAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <PullActionItem
    apiMethod={pullServerGroup}
    resource={resource}
    refetch={refetch}
  />
);
