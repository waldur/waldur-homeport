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
  const backendState = resource.backend_metadata?.state;
  const isActive =
    ['Creating', 'Updating', 'Terminating'].includes(resource.state) ||
    (backendState && !['OK', 'Erred'].includes(backendState));
  return (
    <StateIndicator
      label={runtimeState || backendState || resource.state}
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
