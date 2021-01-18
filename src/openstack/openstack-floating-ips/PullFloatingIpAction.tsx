import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullFloatingIP } from '../api';

export const PullFloatingIpAction = ({ resource }) => (
  <PullActionItem apiMethod={pullFloatingIP} resource={resource} />
);
