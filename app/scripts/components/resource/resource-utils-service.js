// @ngInject
export default function resourceUtils(ncUtils, ncServiceUtils, authService, $filter) {
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
      var summary = parts.join(', ');
      return summary;
    },
    formatFlavor: function(resource) {
      return $filter('formatFlavor')(resource);
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
    getListState: function(resourceCategory) {
      if (resourceCategory === 'apps') {
        return 'project.resources.apps';
      } else if (resourceCategory === 'private_clouds') {
        return 'project.resources.clouds';
      } else if (resourceCategory === 'storages') {
        return 'project.resources.storage.tabs';
      } else if(resourceCategory === 'vms') {
        return 'project.resources.vms';
      }
      return 'project.resources.vms';
    },
  };
}
