import { StateIndicator } from '@waldur/core/StateIndicator';

import { Resource } from '../types';

export const ResourceStateField = ({
  resource,
  roundless,
}: {
  resource: Resource;
  roundless?: boolean;
}) => (
  <StateIndicator
    label={resource.backend_metadata?.runtime_state || resource.state}
    variant={
      resource.state === 'Erred'
        ? 'danger'
        : resource.state === 'Terminated'
        ? 'warning'
        : ['SHUTOFF', 'STOPPED', 'SUSPENDED'].includes(
            resource.backend_metadata?.runtime_state,
          )
        ? 'secondary'
        : 'primary'
    }
    active={['Creating', 'Updating', 'Terminating'].includes(resource.state)}
    roundless={roundless}
  />
);
