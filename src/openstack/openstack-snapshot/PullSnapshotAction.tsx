import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullSnapshot } from '../api';

export const PullSnapshotAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={pullSnapshot}
    resource={resource}
    refetch={refetch}
  />
);
