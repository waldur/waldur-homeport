'use strict';

(function() {
  angular.module('ncsaas')
    .service('resourceUtils', ['ncUtils', 'authService', resourceUtils]);

  function resourceUtils(ncUtils, authService) {
    return {
      setAccessInfo: function(item) {
        item.access_info_text = 'No access info';
        if (!item.access_url) {
          return;
        }

        if (ncUtils.startsWith(item.access_url, "http")) {
          item.access_info_url = item.access_url;
          item.access_info_text = 'Open';

          if (ncUtils.endsWith(item.access_url, "/rdp/")) {
            item.access_info_text = 'Connect';
            item.access_info_url = authService.getDownloadLink(item.access_url);
          }
        } else if (angular.isArray(item.access_url)) {
          // IP addresses
          item.access_info_text = item.access_url.join(', ');
        } else {
          item.access_info_text = item.access_url;
        }
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
          if (scope.resource) {
            scope.resource.service_type = scope.resource.resource_type.split('.')[0];
            scope.resource.customer_uuid = currentStateService.getCustomerUuid();
            resourceUtils.setAccessInfo(scope.resource);
          }
        });
      }
    };
  }
})();
