import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullVirtualMachine } from '../api';

export const PullVirtualMachineAction = ({ resource }) => (
  <PullActionItem apiMethod={pullVirtualMachine} resource={resource} />
);
