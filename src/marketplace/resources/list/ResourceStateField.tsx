import { capitalize, lowerCase } from 'lodash-es';
import { Resource } from 'waldur-js-client';

import { BadgeShape, BadgeTone } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';

export const ResourceStateField = ({
  resource,
  shape,
  tone,
  hasBullet,
  size,
}: {
  resource: Resource;
  shape?: BadgeShape;
  tone?: BadgeTone;
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
              ? 'neutral'
              : 'success'
      }
      active={isActive}
      shape={shape}
      tone={tone}
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
