import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullAllocation } from './api';

export const PullAllocationAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={pullAllocation}
    resource={resource}
    refetch={refetch}
  />
);
