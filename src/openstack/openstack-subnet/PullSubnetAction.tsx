import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullSubnet } from '../api';

export const PullSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={pullSubnet}
    resource={resource}
    refetch={refetch}
  />
);
