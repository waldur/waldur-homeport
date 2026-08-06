import { openportalAllocationsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullAllocationAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openportalAllocationsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
