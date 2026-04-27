import { openstackServerGroupsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullServerGroupAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackServerGroupsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
