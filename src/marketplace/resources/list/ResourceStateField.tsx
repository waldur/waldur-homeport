import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

import { Resource } from '../types';

export const ResourceStateField = ({
  resource,
  roundless,
  light,
  outline,
  pill,
  hasBullet,
}: {
  resource: Resource;
  roundless?: boolean;
  light?: boolean;
  outline?: boolean;
  pill?: boolean;
  hasBullet?: boolean;
}) => {
  const runtimeState = resource.backend_metadata?.runtime_state;
  const backendState = resource.backend_metadata?.state;
  const isActive =
    ['Creating', 'Updating', 'Terminating'].includes(resource.state) ||
    (backendState && !['OK', 'Erred'].includes(backendState));

  const state = runtimeState || backendState || resource.state;
  return (
    <StateIndicator
      label={state}
      variant={
        state === 'Erred'
          ? 'danger'
          : state === 'Terminated'
            ? 'warning'
            : ['SHUTOFF', 'STOPPED', 'SUSPENDED'].includes(runtimeState)
              ? 'secondary'
              : 'primary'
      }
      active={isActive}
      roundless={roundless}
      light={light}
      outline={outline}
      pill={pill}
      hasBullet={hasBullet}
      tooltip={
        resource.backend_metadata.action
          ? translate('{action} in progress', {
              action: resource.backend_metadata.action,
            })
          : ''
      }
    />
  );
};
