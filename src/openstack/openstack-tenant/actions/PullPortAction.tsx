import { openstackPortsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullPortAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackPortsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
