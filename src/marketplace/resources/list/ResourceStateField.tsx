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
    label={resource.state}
    variant={
      resource.state === 'Erred'
        ? 'danger'
        : resource.state === 'Terminated'
        ? 'warning'
        : 'primary'
    }
    active={['Creating', 'Updating', 'Terminating'].includes(resource.state)}
    roundless={roundless}
  />
);
