import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullNetwork } from '../../api';

export const PullNetworkAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={pullNetwork}
    resource={resource}
    refetch={refetch}
  />
);
