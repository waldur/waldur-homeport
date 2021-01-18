import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullAllocation } from './api';

export const PullAllocationAction = ({ resource }) => (
  <PullActionItem apiMethod={pullAllocation} resource={resource} />
);
