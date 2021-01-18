import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullNetwork } from '../../api';

export const PullNetworkAction = ({ resource }) => (
  <PullActionItem apiMethod={pullNetwork} resource={resource} />
);
