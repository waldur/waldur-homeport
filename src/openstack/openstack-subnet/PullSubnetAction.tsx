import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullSubnet } from '../api';

export const PullSubnetAction = ({ resource }) => (
  <PullActionItem apiMethod={pullSubnet} resource={resource} />
);
