import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullFloatingIP } from '../api';

export const PullFloatingIpAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={pullFloatingIP}
    resource={resource}
    refetch={refetch}
  />
);
