import { capitalize, lowerCase } from 'es-toolkit/compat';
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

const formatState = (state: string) =>
  state === 'OK' ? state : capitalize(lowerCase(state));

// The cloud reports a broken object in its own words: Nova ERROR, Cinder
// error, error_extending, error_deleting and so on.
const isErrorRuntimeState = (runtimeState?: string) =>
  runtimeState === 'ERRED' || /^error/i.test(runtimeState ?? '');

/**
 * Why the resource counts as erred, or null when it does not. Checked from
 * the most specific layer to the least: what the cloud reports, then the
 * backend object Waldur keeps for it, then the marketplace resource itself.
 */
export const getResourceErrorReason = (resource: Resource): string | null => {
  const runtimeState = resource.backend_metadata?.runtime_state;
  const backendState = resource.backend_metadata?.state;
  if (isErrorRuntimeState(runtimeState)) {
    return translate('The provider reports this resource as {state}.', {
      state: formatState(runtimeState),
    });
  }
  if (backendState === 'ERRED' || backendState === 'Erred') {
    return translate('An operation on the provider side failed.');
  }
  if (resource.state === 'Erred') {
    return translate('The last operation on this resource failed.');
  }
  return null;
};

export const getResourceStateVariant = (resource: Resource): BadgeVariant => {
  if (getResourceErrorReason(resource)) {
    return 'danger';
  }
  const runtimeState = resource.backend_metadata?.runtime_state;
  const backendState = resource.backend_metadata?.state;
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

  // Label, colour and tooltip all follow the same decision, so a red badge
  // never carries a healthy label such as OK or Active.
  const errorReason = getResourceErrorReason(resource);
  const label = errorReason
    ? translate('Erred')
    : formatState(runtimeState || backendState || resource.state);
  const tooltip = errorReason
    ? [errorReason, resource.error_message].filter(Boolean).join(' ')
    : resource.backend_metadata?.action
      ? translate('{action} in progress', {
          action: resource.backend_metadata.action,
        })
      : '';
  return (
    <StateIndicator
      label={label}
      variant={getResourceStateVariant(resource)}
      active={isActive}
      shape={shape}
      tone={tone}
      hasBullet={hasBullet}
      size={size}
      tooltip={tooltip}
      data-testid="state-indicator"
    />
  );
};
