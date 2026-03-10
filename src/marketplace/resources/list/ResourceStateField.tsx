import { capitalize, lowerCase } from 'lodash-es';
import { Resource } from 'waldur-js-client';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

export const ResourceStateField = ({
  resource,
  roundless,
  light,
  outline,
  pill,
  hasBullet,
  size,
}: {
  resource: Resource;
  roundless?: boolean;
  light?: boolean;
  outline?: boolean;
  pill?: boolean;
  hasBullet?: boolean;
  size?: 'sm' | 'lg';
}) => {
  const runtimeState = resource.backend_metadata?.runtime_state;
  const backendState = resource.backend_metadata?.state;
  const isActive =
    ['Creating', 'Updating', 'Terminating'].includes(resource.state) ||
    (backendState && !['OK', 'ERRED', 'Deleted'].includes(backendState));
  const isErred =
    [runtimeState, resource.state, backendState].includes('Erred') ||
    [runtimeState, resource.state, backendState].includes('ERRED');
  const isDead = resource.state === 'Terminated' || backendState === 'Deleted';

  const state = runtimeState || backendState || resource.state;
  return (
    <StateIndicator
      label={state === 'OK' ? state : capitalize(lowerCase(state))}
      variant={
        isErred
          ? 'danger'
          : isDead
            ? 'warning'
            : ['SHUTOFF', 'STOPPED', 'SUSPENDED'].includes(runtimeState)
              ? 'default'
              : 'success'
      }
      active={isActive}
      roundless={roundless}
      light={light}
      outline={outline}
      pill={pill}
      hasBullet={hasBullet}
      size={size}
      tooltip={
        resource.backend_metadata?.action
          ? translate('{action} in progress', {
              action: resource.backend_metadata.action,
            })
          : ''
      }
      data-testid="state-indicator"
    />
  );
};
