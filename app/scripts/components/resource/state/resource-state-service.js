// @ngInject
export default function resourceStateService(resourceUtils, ResourceStateConfiguration) {
  return {
    getResourceState(resource) {
      let resourceType = resourceUtils.formatResourceType(resource);
      let config = ResourceStateConfiguration[resource.resource_type] || {};
      let runtimeShutdownStates = config.shutdown_states || [];
      let runtimeErrorStates = config.error_states || [];
      let context = {
        className: '',
        label: '',
        tooltip: '',
        movementClassName: ''
      };
      let showRuntimeState = false;

      if (runtimeErrorStates.indexOf(resource.runtime_state) !== -1) {
        context.className = 'progress-bar-danger';
      }
      if (resource.state.toLowerCase() === 'ok') {
        if (runtimeShutdownStates.indexOf(resource.runtime_state) !== -1) {
          context.className = 'progress-bar-plain';
        }
        context.label = resource.runtime_state || resource.state;
        if (resource.service_settings_state.toLowerCase() !== 'erred') {
          context.className = context.className || 'progress-bar-primary';
          context.tooltip = 'Resource is in sync';
          showRuntimeState = true;
        } else {
          let errorMessage = resource.service_settings_error_message;
          context.className = context.className || 'progress-bar-warning';
          context.tooltip = 'Service settings of this resource are in state erred';
          if (errorMessage) {
            context.tooltip += `, error message: ${errorMessage}`;
          }
        }
      } else if (resource.state.toLowerCase() === 'erred') {
        context.className = 'progress-bar-warning';
        context.label = resource.runtime_state || resource.state;
        context.tooltip = 'Failed to operate with backend';
        let errorMessage = resource.error_message;
        if (errorMessage) {
          context.tooltip += `, error message: ${errorMessage}`;
        }
      } else {
        showRuntimeState = true;
        context.className = 'progress-bar-primary';
        context.movementClassName = 'progress-striped active';
        if (resource.action) {
          context.label = resource.action;
          context.tooltip = resource.action_details.message || `${resource.action} ${resourceType}`;
        } else {
          context.label = resource.state;
          if (runtimeErrorStates.indexOf(resource.state) !== -1) {
            context.tooltip = `${resourceType} has state ${resource.state}`;
          } else {
            context.tooltip = `${resource.state} ${resourceType}`;
          }
        }
      }

      if (showRuntimeState && resource.runtime_state) {
        context.tooltip += `, current state on backend: ${resource.runtime_state}`;
      }

      return context;
    }
  };
}
