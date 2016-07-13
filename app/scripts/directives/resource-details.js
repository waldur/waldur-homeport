'use strict';

(function() {
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
            resourceUtils.setAccessInfo(resource);
            resource.service_type = resource.resource_type.split('.')[0];
            resource.customer_uuid = currentStateService.getCustomerUuid();
            resource.summary = resourceUtils.setSummary(resource);
            scope.formatted_resource_type = resourceUtils.formatResourceType(resource);
            scope.state_class = resourceUtils.getStateClass(resource);
            resource.uptime = resourceUtils.getUptime(resource);
          }
        });
      }
    };
  }
})();
