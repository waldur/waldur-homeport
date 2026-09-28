import { capitalize, lowerCase } from 'lodash-es';
import { Resource } from 'waldur-js-client';

import { BadgeShape, BadgeTone, BadgeVariant } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';

// Runtime states of a stopped resource, as each backend reports them:
// OpenStack SHUTOFF, VMware POWERED_OFF, and so on.
const STOPPED_RUNTIME_STATES = [
  'SHUTOFF',
  'STOPPED',
  'SUSPENDED',
  'POWERED_OFF',
];

export const getResourceStateVariant = (resource: Resource): BadgeVariant => {
  const runtimeState = resource.backend_metadata?.runtime_state;
  const backendState = resource.backend_metadata?.state;
  const states = [runtimeState, resource.state, backendState];
  if (states.includes('Erred') || states.includes('ERRED')) {
    return 'danger';
  }
  if (resource.state === 'Terminated' || backendState === 'Deleted') {
    return 'warning';
  }
  return STOPPED_RUNTIME_STATES.includes(runtimeState) ? 'neutral' : 'success';
};

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

  const state = runtimeState || backendState || resource.state;
  return (
    <StateIndicator
      label={state === 'OK' ? state : capitalize(lowerCase(state))}
      variant={getResourceStateVariant(resource)}
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
