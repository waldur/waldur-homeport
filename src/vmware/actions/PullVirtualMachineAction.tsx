import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullVirtualMachine } from '../api';

export const PullVirtualMachineAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <PullActionItem
    apiMethod={pullVirtualMachine}
    resource={resource}
    refetch={refetch}
  />
);
