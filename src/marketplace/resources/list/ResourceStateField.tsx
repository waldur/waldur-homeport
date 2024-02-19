import { StateIndicator } from '@waldur/core/StateIndicator';

import { Resource } from '../types';

export const ResourceStateField = ({
  resource,
  roundless,
}: {
  resource: Resource;
  roundless?: boolean;
}) => {
  const runtimeState = resource.backend_metadata?.runtime_state;
  const isActive =
    ['Creating', 'Updating', 'Terminating'].includes(resource.state) ||
    ['Creating', 'Updating', 'Deleting'].includes(
      resource.backend_metadata?.state,
    );
  return (
    <StateIndicator
      label={runtimeState || resource.state}
      variant={
        resource.state === 'Erred'
          ? 'danger'
          : resource.state === 'Terminated'
          ? 'warning'
          : ['SHUTOFF', 'STOPPED', 'SUSPENDED'].includes(runtimeState)
          ? 'secondary'
          : 'primary'
      }
      active={isActive}
      roundless={roundless}
    />
  );
};
