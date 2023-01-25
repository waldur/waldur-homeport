import { pullVolume } from '@waldur/openstack/api';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const PullAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    resource={resource}
    apiMethod={pullVolume}
    refetch={refetch}
  />
);
