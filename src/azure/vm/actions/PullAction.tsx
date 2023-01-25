import { pullVirtualMachine } from '@waldur/azure/api';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const PullAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={pullVirtualMachine}
    resource={resource}
    refetch={refetch}
  />
);
