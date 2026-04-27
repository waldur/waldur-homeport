import { openstackFloatingIpsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullFloatingIpAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackFloatingIpsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
