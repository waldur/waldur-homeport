'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourceUtils', [
      'ncUtils', 'authService', '$filter', 'ENV', 'ncServiceUtils', resourceUtils]);

  function resourceUtils(ncUtils, authService, $filter, ENV, ncServiceUtils) {
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
        var parts = resource.resource_type.split(".");
        var service = ncServiceUtils.getTypeDisplay(parts[0]);
        return service + " " + parts[1];
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
        var service_type = type.split(".")[0];
        return "/static/images/appstore/icon-" + service_type.toLowerCase() + ".png";
      }
    }
  }
})();
