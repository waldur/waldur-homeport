import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { destroyServerGroup } from '../api';

export const DestroyServerGroupAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DestroyActionItem
    apiMethod={destroyServerGroup}
    resource={resource}
    refetch={refetch}
  />
);
