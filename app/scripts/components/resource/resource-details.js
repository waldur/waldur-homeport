import template from './resource-details.html';
import './resource-details.scss';

export default function resourceDetails() {
  return {
    restrict: 'E',
    template: template,
    controller: ResourceDetailsController,
    scope: {
      resource: '='
    }
  }
}

// @ngInject
function ResourceDetailsController($scope, resourceUtils, ncUtils, currentStateService) {
  $scope.$watch('resource', function() {
    var resource = $scope.resource;
    if (resource) {
      resource.isVolume = resource.resource_type.toLowerCase().indexOf('volume') !== -1;
      resource.summaryLabel = resource.isVolume ? 'Size' : 'Summary';
      resourceUtils.setAccessInfo(resource);
      resource.service_type = resource.resource_type.split('.')[0];
      resource.customer_uuid = currentStateService.getCustomerUuid();
      resource.summary = resourceUtils.getSummary(resource);
      $scope.formatted_resource_type = resourceUtils.formatResourceType(resource);
      $scope.state_class = resourceUtils.getStateClass(resource);
      resource.uptime = resourceUtils.getUptime(resource);

      if (resource.instance) {
        resource.instance_uuid = ncUtils.getUUID(resource.instance);
      }

      if (resource.source_volume) {
        resource.source_volume_uuid = ncUtils.getUUID(resource.source_volume);
      }
    }
  });
}
