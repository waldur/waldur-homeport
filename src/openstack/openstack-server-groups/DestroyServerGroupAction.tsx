import { openstackServerGroupsDestroy } from 'waldur-js-client';

import { DestroyActionItem } from '@/resource/actions/DestroyActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const DestroyServerGroupAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DestroyActionItem
    apiMethod={(id) => openstackServerGroupsDestroy({ path: { uuid: id } })}
    resource={resource}
    refetch={refetch}
  />
);
