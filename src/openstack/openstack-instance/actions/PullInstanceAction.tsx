import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullInstance } from '../../api';

export const PullInstanceAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={pullInstance}
    resource={resource}
    refetch={refetch}
  />
);
