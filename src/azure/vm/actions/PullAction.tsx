import { azureVirtualmachinesPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(id) => azureVirtualmachinesPull({ path: { uuid: id } })}
    resource={resource}
    refetch={refetch}
  />
);
