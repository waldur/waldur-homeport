import { pullVirtualMachine } from '@waldur/azure/api';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

export const PullAction = ({ resource }) => (
  <PullActionItem apiMethod={pullVirtualMachine} resource={resource} />
);
