import { pullVolume } from '@waldur/openstack/api';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

export const PullAction = ({ resource }) => (
  <PullActionItem resource={resource} apiMethod={pullVolume} />
);
