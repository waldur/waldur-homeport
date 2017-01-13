// @ngInject
export default function resourceUtils(ncUtils, ncServiceUtils, authService, $filter, ENV, ResourceStateConfiguration) {
  return {
    setAccessInfo: function(resource) {
      resource.access_info_text = 'No access info';
      if (!resource.access_url) {
        return;
      }

      if (ncUtils.startsWith(resource.access_url, 'http')) {
        resource.access_info_url = resource.access_url;
        resource.access_info_text = 'Open';

        if (ncUtils.endsWith(resource.access_url, '/rdp/')) {
          resource.access_info_text = 'Connect';
          resource.access_info_url = authService.getDownloadLink(resource.access_url);
        }
      } else if (angular.isArray(resource.access_url)) {
        // IP addresses
        resource.access_info_text = resource.access_url.join(', ');
      } else {
        resource.access_info_text = resource.access_url;
      }
    },
    getSummary: function(resource) {
      var parts = [];
      if (resource.image_name) {
        parts.push(resource.image_name);
      }
      var flavor = this.formatFlavor(resource);
      if (flavor) {
        parts.push(flavor);
      }
      if (resource.bootable) {
        parts.push('bootable');
      }
      if (resource.size) {
        parts.push($filter('filesize')(resource.size));
      }
      var summary = parts.join(', ');
      return summary;
    },
    formatFlavor: function(resource) {
      if (resource) {
        var parts = [];
        if (resource.cores) {
          parts.push(resource.cores + ' vCPU');
        }
        if (resource.ram) {
          parts.push($filter('filesize')(resource.ram) + ' memory');
        }
        if (resource.disk) {
          parts.push($filter('filesize')(resource.disk) + ' storage');
        }
        var summary = parts.join(', ');
        return summary;
      }
    },
    formatResourceType: function(resource) {
      var parts = resource.resource_type.split('.');
      var service = ncServiceUtils.getTypeDisplay(parts[0]);
      return service + ' ' + parts[1];
    },
    getUptime: function(resource) {
      if (resource.start_time) {
        return ncUtils.relativeDate(resource.start_time);
      }
    },
    getIcon: function(item) {
      var type = item.resource_type || item.type;
      var service_type = ncServiceUtils.getTypeDisplay(type.split('.')[0]);
      return 'static/images/appstore/icon-' + service_type.toLowerCase() + '.png';
    },
    getResourceState: function(resource) {
      let resourceType = this.formatResourceType(resource);
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
