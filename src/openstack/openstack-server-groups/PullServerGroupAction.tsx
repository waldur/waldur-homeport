import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullServerGroup } from '../api';

export const PullServerGroupAction = ({ resource }) => (
  <PullActionItem apiMethod={pullServerGroup} resource={resource} />
);
