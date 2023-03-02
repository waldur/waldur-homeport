import { getProps } from '@waldur/openstack/openstack-instance/actions/StartAction';

import { VirtualMachineMultiAction } from './VirtualMachineMultiAction';

export const MultiStartAction = ({ rows, refetch }) => (
  <VirtualMachineMultiAction rows={rows} refetch={refetch} {...getProps()} />
);
