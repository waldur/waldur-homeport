import { getProps } from '@waldur/openstack/openstack-instance/actions/RestartAction';

import { VirtualMachineMultiAction } from './VirtualMachineMultiAction';

export const MultiRestartAction = ({ rows, refetch }) => (
  <VirtualMachineMultiAction {...getProps()} rows={rows} refetch={refetch} />
);
