import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullDisk } from '../api';

export const PullDiskAction = ({ resource }) => (
  <PullActionItem apiMethod={pullDisk} resource={resource} />
);
