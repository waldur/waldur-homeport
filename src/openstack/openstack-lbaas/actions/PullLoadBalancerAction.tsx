import { openstackLoadbalancersPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullLoadBalancerAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackLoadbalancersPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
