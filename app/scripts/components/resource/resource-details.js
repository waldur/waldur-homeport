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
  };
}

// @ngInject
function ResourceDetailsController($scope, resourceUtils, ncUtils, currentStateService, ENV) {
  $scope.$watch('resource', function() {
    var resource = $scope.resource;
    if (resource) {
      resource.isVolume = resource.resource_type.toLowerCase().indexOf('volume') !== -1;
      resource.isBackup = resource.resource_type.toLowerCase().indexOf('backup') !== -1;
      resource.label = resource.isBackup ? 'Instance' : 'Attached to';
      resource.summaryLabel = resource.isVolume ? 'Size' : 'Summary';
      resourceUtils.setAccessInfo(resource);
      resource.service_type = resource.resource_type.split('.')[0];
      resource.customer_uuid = currentStateService.getCustomerUuid();
      resource.summary = resourceUtils.getSummary(resource);
      $scope.formatted_resource_type = resourceUtils.formatResourceType(resource);
      resource.uptime = resourceUtils.getUptime(resource);
      resource.error_message = resource.error_message || ENV.defaultErrorMessage;

      if (resource.instance) {
        resource.instance_uuid = ncUtils.getUUID(resource.instance);
      }

      if (resource.source_volume) {
        resource.source_volume_uuid = ncUtils.getUUID(resource.source_volume);
      }
    }
  });
}
