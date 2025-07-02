import { PlayIcon } from '@phosphor-icons/react';

import { getProps } from '@waldur/openstack/openstack-instance/actions/StartAction';

import { VirtualMachineMultiAction } from './VirtualMachineMultiAction';

export const MultiStartAction = ({ rows, refetch }) => (
  <VirtualMachineMultiAction
    iconNode={<PlayIcon weight="bold" />}
    rows={rows}
    refetch={refetch}
    {...getProps()}
  />
);
