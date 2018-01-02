import { Translate } from '@waldur/i18n/types';
import { formatResourceType } from '@waldur/resource/utils';

import { getStateMessages } from './constants';
import { Resource, StateIndicator } from './types';

export function getResourceState(resource: Resource, translate: Translate): StateIndicator {
  const resourceType = formatResourceType(resource);
  const runtimeShutdownStates = ['SHUTOFF', 'STOPPED', 'SUSPENDED'];
  const runtimeErrorStates = ['ERROR', 'ERRED'];
  const runtimeState = resource.runtime_state && resource.runtime_state.toUpperCase();
  let messageSuffix = null;
  const context = {
    className: '',
    label: '',
    tooltip: '',
    movementClassName: '',
  };
  let showRuntimeState = false;

  if (runtimeErrorStates.indexOf(runtimeState) !== -1) {
    context.className = 'progress-bar-danger';
  }
  if (resource.state.toLowerCase() === 'ok') {
    if (runtimeShutdownStates.indexOf(runtimeState) !== -1) {
      context.className = 'progress-bar-plain';
    }
    context.label = runtimeState || resource.state;
    if (resource.service_settings_state.toLowerCase() !== 'erred') {
      context.className = context.className || 'progress-bar-primary';
      context.tooltip = translate('Resource is in sync');
      showRuntimeState = true;
    } else {
      const errorMessage = resource.service_settings_error_message;
      context.className = context.className || 'progress-bar-warning';
      context.tooltip = translate('Service settings of this resource are in state erred.');
      if (errorMessage) {
        messageSuffix = translate('error message: {errorMessage}', { errorMessage });
        context.tooltip += (', ' + messageSuffix);
      }
    }
  } else if (resource.state.toLowerCase() === 'erred') {
    context.className = 'progress-bar-warning';
    context.label = runtimeState || resource.state;
    context.tooltip = translate('Failed to operate with backend.');
    const errorMessage = resource.error_message;
    if (errorMessage) {
      messageSuffix = translate('error message: {errorMessage}', { errorMessage });
      context.tooltip += (', ' + messageSuffix);
    }
  } else {
    showRuntimeState = true;
    context.className = 'progress-bar-primary';
    context.movementClassName = 'progress-striped active';
    if (resource.action) {
      context.label = getStateMessages(translate)[resource.action.toLowerCase()] || resource.action;
      context.tooltip = translate(resource.action_details.message) || `${resource.action} ${resourceType}`;
    } else {
      context.label = resource.state;
      if (runtimeErrorStates.indexOf(resource.state) !== -1) {
        context.tooltip = translate('{resourceType} has state {resourceState}',
        { resourceType, resourceState: resource.state });
      } else {
        context.tooltip = `${resource.state} ${resourceType}`;
      }
    }
  }

  if (showRuntimeState && runtimeState) {
    messageSuffix = translate('current state on backend: {resourceState}.',
    { resourceState: runtimeState });
    context.tooltip += (', ' + messageSuffix);
  }

  return context;
}
