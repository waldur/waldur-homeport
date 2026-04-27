import { openstackSnapshotsPull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullSnapshotAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackSnapshotsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
