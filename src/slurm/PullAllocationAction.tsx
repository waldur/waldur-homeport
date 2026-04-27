import { slurmAllocationsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullAllocationAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(id) => slurmAllocationsPull({ path: { uuid: id } })}
    resource={resource}
    refetch={refetch}
  />
);
