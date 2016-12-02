// @ngInject
export default function resourceUtils(ncUtils, ncServiceUtils, authService, $filter, ENV, ResourceStateConfiguration) {
  return {
    setAccessInfo: function(resource) {
      resource.access_info_text = 'No access info';
      if (!resource.access_url) {
        return;
      }

      if (ncUtils.startsWith(resource.access_url, "http")) {
        resource.access_info_url = resource.access_url;
        resource.access_info_text = 'Open';

        if (ncUtils.endsWith(resource.access_url, "/rdp/")) {
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
    getStateClass: function(resource) {
      return ENV.resourceStateColorClasses[resource.state];
    },
    getUptime: function(resource) {
      if (resource.start_time) {
        return moment(resource.start_time).fromNow().replace(' ago', '');
      }
    },
    getIcon: function(item) {
      var type = item.resource_type || item.type;
      var service_type = ncServiceUtils.getTypeDisplay(type.split('.')[0]);
      return '/static/images/appstore/icon-' + service_type.toLowerCase() + '.png';
    },
    getResourceState: function(resource) {
      var runtimeShutdownStates = [];
      var runtimeErrorStates = [];
      var resourceType = this.formatResourceType(resource);
      var config = ResourceStateConfiguration[resource.resource_type];
      if (config) {
        runtimeShutdownStates = config.shutdown_states || [];
        runtimeErrorStates = config.error_states || [];
      }
      var context = {};
      context.className = null;
      var movement = false;
      context.label = null;
      context.tooltip = null;

      if (runtimeErrorStates.indexOf(resource.runtime_state) !== -1) {
        context.className = 'progress-bar-danger';
      }
      if(resource.state.toLowerCase() === 'ok') {
        if (runtimeShutdownStates.indexOf(resource.runtime_state) !== -1) {
          context.className = 'progress-bar-plain';
        }
        context.label = resource.runtime_state || resource.state;
        if (resource.service_settings_state.toLowerCase() !== 'erred') {
          context.className = context.className || 'progress-bar-primary';
          context.tooltip = `Resource in sync on backend, currently in state ${resource.runtime_state}`;
        } else {
          var errorMessage = resource.service_settings_error_message || ENV.defaultErrorMessage;
          context.className = context.className || 'progress-bar-warning';
          context.tooltip = `Service settings of this resource are in state erred, error message received: ${errorMessage}`;
        }
      } else if (resource.state.toLowerCase() === 'erred') {
        context.className = 'progress-bar-warning';
        context.label = resource.runtime_state || resource.state;
        context.tooltip = `Failed to operate with backend, ${resource.error_message}`;
      } else {
        movement = true;
        context.className = 'progress-bar-primary';
        if (resource.action) {
          var descriptionState = resource.action_details.message || `${resource.action} ${resourceType}`;
          context.label = resource.action;
          context.tooltip = `${descriptionState}, current state on backend: ${resource.runtime_state}`;
        } else {
          context.label = resource.state;
          if (runtimeErrorStates.indexOf(resource.state) !== -1) {
            context.tooltip = `${resourceType} has state ${resource.state}, current state on backend: ${resource.runtime_state}`;
          } else {
            context.tooltip = `${resource.state} ${resourceType}, current state on backend: ${resource.runtime_state}`;
          }
        }
      }
      context.movementClassName = movement ? 'progress-striped active' : '';

      return context;
    }
  };
}
