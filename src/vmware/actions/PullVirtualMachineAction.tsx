import { vmwareVirtualMachinePull } from 'waldur-js-client';

import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const PullVirtualMachineAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <PullActionItem
    apiMethod={(id) => vmwareVirtualMachinePull({ path: { uuid: id } })}
    resource={resource}
    refetch={refetch}
  />
);
