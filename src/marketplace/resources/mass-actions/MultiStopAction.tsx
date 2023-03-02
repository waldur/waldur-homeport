import { getProps } from '@waldur/openstack/openstack-instance/actions/StopAction';

import { VirtualMachineMultiAction } from './VirtualMachineMultiAction';

export const MultiStopAction = ({ rows, refetch }) => (
  <VirtualMachineMultiAction rows={rows} refetch={refetch} {...getProps()} />
);
