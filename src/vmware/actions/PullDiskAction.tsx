import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullDisk } from '../api';

export const PullDiskAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem apiMethod={pullDisk} resource={resource} refetch={refetch} />
);
