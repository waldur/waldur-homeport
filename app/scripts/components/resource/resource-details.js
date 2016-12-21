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
      resource.summaryLabel = resource.isVolume ? 'Size' : 'Summary';
      resourceUtils.setAccessInfo(resource);
      resource.service_type = resource.resource_type.split('.')[0];
      resource.customer_uuid = currentStateService.getCustomerUuid();
      resource.summary = resourceUtils.getSummary(resource);
      $scope.formatted_resource_type = resourceUtils.formatResourceType(resource);
      resource.uptime = resourceUtils.getUptime(resource);
      resource.error_message = resource.error_message || ENV.defaultErrorMessage;
      resource.displaySecurityGroups = securityGroupsFormatter(resource.security_groups);

      if (resource.instance) {
        resource.instance_uuid = ncUtils.getUUID(resource.instance);
      }

      if (resource.source_volume) {
        resource.source_volume_uuid = ncUtils.getUUID(resource.source_volume);
      }
    }
  });

  function securityGroupsFormatter(securityGroups) {
    let displayGroups = [];
    securityGroups.forEach(function(item) {
      let rules = item.rules.map(function(rule) {
        let port = rule.from_port === rule.to_port ?
          `port: ${rule.from_port}` :
          `ports: ${rule.from_port}-${rule.to_port}`;
        return `${rule.protocol}, ${port}, cidr: ${rule.cidr}`
      }).join('<br />');
      let description = item.description ? `${item.description} <br />` : ``;
      displayGroups.push({
        name: item.name,
        rules: `${description} ${rules}`
      });
    });
    return displayGroups
  }
}
