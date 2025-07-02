import { StopIcon } from '@phosphor-icons/react';

import { getProps } from '@waldur/openstack/openstack-instance/actions/StopAction';

import { VirtualMachineMultiAction } from './VirtualMachineMultiAction';

export const MultiStopAction = ({ rows, refetch }) => (
  <VirtualMachineMultiAction
    iconNode={<StopIcon weight="bold" />}
    rows={rows}
    refetch={refetch}
    {...getProps()}
  />
);
