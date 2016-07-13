'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourceUtils', [
      'ncUtils', 'authService', '$filter', 'ENV', resourceUtils]);

  function resourceUtils(ncUtils, authService, $filter, ENV) {
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
      setSummary: function(resource) {
        var parts = [];
        if (resource.image_name) {
          parts.push(resource.image_name);
        }
        if (resource.cores) {
          parts.push(resource.cores + ' vCPU');
        }
        if (resource.ram) {
          parts.push($filter('mb2gb')(resource.ram) + ' memory');
        }
        if (resource.disk) {
          parts.push($filter('mb2gb')(resource.disk) + ' storage');
        }
        if (resource.bootable) {
          parts.push('bootable');
        }
        if (resource.size) {
          parts.push($filter('mb2gb')(resource.size));
        }
        var summary = parts.join(' / ');
        return summary;
      },
      formatResourceType: function(resource) {
        return resource.resource_type.split(".").join(" ");
      },
      getStateClass: function(resource) {
        return ENV.resourceStateColorClasses[resource.state];
      },
      getUptime: function(resource) {
        if (resource.start_time) {
          return moment(resource.start_time).fromNow().replace(' ago', '');
        }
      }
    }
  }
})();
