import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullSecurityGroup } from '../api';

export const PullSecurityGroupAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <PullActionItem
    apiMethod={pullSecurityGroup}
    resource={resource}
    refetch={refetch}
  />
);
