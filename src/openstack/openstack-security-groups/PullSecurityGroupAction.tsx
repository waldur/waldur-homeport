import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullSecurityGroup } from '../api';

export const PullSecurityGroupAction = ({ resource }) => (
  <PullActionItem apiMethod={pullSecurityGroup} resource={resource} />
);
