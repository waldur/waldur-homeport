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
        var summary = parts.join(' / ');
        resource.summary = summary;
      },
      formatResourceType: function(resource) {
        resource.formatted_resource_type = resource.resource_type.split(".").join(" ");
      },
      getStateClass: function(resource) {
        return ENV.resourceStateColorClasses[resource.state];
      }
    }
  }

  angular.module('ncsaas')
    .directive('resourceDetails', [
      'resourceUtils', 'currentStateService', resourceDetails]);

  function resourceDetails(resourceUtils, currentStateService) {
    return {
      restrict: 'E',
      scope: {
        'resource': '='
      },
      templateUrl: 'views/directives/resource-details.html',
      link: function(scope) {
        scope.$watch('resource', function() {
          var resource = scope.resource;
          if (resource) {
            resource.service_type = resource.resource_type.split('.')[0];
            resource.customer_uuid = currentStateService.getCustomerUuid();
            resourceUtils.setAccessInfo(resource);
            resourceUtils.setSummary(resource);
            resourceUtils.formatResourceType(resource);
            scope.state_class = resourceUtils.getStateClass(resource);
          }
        });
      }
    };
  }
})();
