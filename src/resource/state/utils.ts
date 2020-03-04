import { StateIndicatorProps } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/resource/types';
import { formatResourceType } from '@waldur/resource/utils';

import { getStateMessages } from './constants';

export function getResourceState(resource: Resource): StateIndicatorProps {
  const resourceType = formatResourceType(resource);
  const runtimeShutdownStates = ['SHUTOFF', 'STOPPED', 'SUSPENDED'];
  const runtimeErrorStates = ['ERROR', 'ERRED'];
  const state = resource.state && resource.state.toLowerCase();
  const runtimeState =
    resource.runtime_state && resource.runtime_state.toUpperCase();
  let messageSuffix = null;
  const context: StateIndicatorProps = {
    variant: 'primary',
    label: '',
    tooltip: '',
    active: false,
  };
  let showRuntimeState = false;

  if (runtimeErrorStates.indexOf(runtimeState) !== -1) {
    context.variant = 'danger';
  }
  if (state === 'ok') {
    if (runtimeShutdownStates.indexOf(runtimeState) !== -1) {
      context.variant = 'plain';
    }
    context.label = runtimeState || resource.state;
    if (
      resource.service_settings_state &&
      resource.service_settings_state.toLowerCase() === 'erred'
    ) {
      const errorMessage = resource.service_settings_error_message;
      context.variant = 'warning';
      context.tooltip = translate(
        'Service settings of this resource are in state erred.',
      );
      if (errorMessage) {
        messageSuffix = translate('error message: {errorMessage}', {
          errorMessage,
        });
        context.tooltip += ', ' + messageSuffix;
      }
    } else {
      context.variant = context.variant || 'primary';
      context.tooltip = translate('Resource is in sync');
      showRuntimeState = true;
    }
  } else if (state === 'erred') {
    context.variant = 'warning';
    context.label = runtimeState || resource.state;
    context.tooltip = translate('Failed to operate with backend.');
    const errorMessage = resource.error_message;
    if (errorMessage) {
      messageSuffix = translate('error message: {errorMessage}', {
        errorMessage,
      });
      context.tooltip += ', ' + messageSuffix;
    }
  } else {
    showRuntimeState = true;
    context.variant = 'primary';
    context.active = true;
    if (resource.action) {
      context.label =
        getStateMessages(translate)[resource.action.toLowerCase()] ||
        resource.action;
      context.tooltip =
        translate(resource.action_details.message) ||
        `${resource.action} ${resourceType}`;
    } else {
      context.label = resource.state;
      if (runtimeErrorStates.indexOf(resource.state) !== -1) {
        context.tooltip = translate(
          '{resourceType} has state {resourceState}',
          { resourceType, resourceState: resource.state },
        );
      } else {
        context.tooltip = `${resource.state} ${resourceType}`;
      }
    }
  }

  if (showRuntimeState && runtimeState) {
    messageSuffix = translate('current state on backend: {resourceState}.', {
      resourceState: runtimeState,
    });
    context.tooltip += ', ' + messageSuffix;
  }

  return context;
}
