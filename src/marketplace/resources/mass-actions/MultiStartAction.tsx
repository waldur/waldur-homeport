import { Play } from '@phosphor-icons/react';

import { getProps } from '@waldur/openstack/openstack-instance/actions/StartAction';

import { VirtualMachineMultiAction } from './VirtualMachineMultiAction';

export const MultiStartAction = ({ rows, refetch }) => (
  <VirtualMachineMultiAction
    iconNode={<Play />}
    rows={rows}
    refetch={refetch}
    {...getProps()}
  />
);
