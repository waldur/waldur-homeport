// @ngInject
export default function registerExtensionPoint(extensionPointService, features) {
  if (features.isVisible('marketplace')) {
    extensionPointService.register('resource-details-button',
      '<span ng-if="$ctrl.resource.marketplace_offering_uuid">'+
        '<marketplace-offering-details-button offering="$ctrl.resource.marketplace_offering_uuid"></marketplace-offering-details-button>'+
      '</span>');

    extensionPointService.register('offering-details-button',
      '<span ng-if="$ctrl.offering.marketplace_offering_uuid">'+
        '<marketplace-offering-details-button offering="$ctrl.offering.marketplace_offering_uuid"></marketplace-offering-details-button>'+
      '</span>');

    extensionPointService.register('resource-details-button',
      '<span ng-if="$ctrl.resource.is_usage_based">'+
        '<marketplace-resource-show-usage-button resource="$ctrl.resource.marketplace_resource_uuid"></marketplace-resource-show-usage-button>'+
      '</span>');

    extensionPointService.register('offering-details-button',
      '<span ng-if="$ctrl.offering.is_usage_based">'+
        '<marketplace-resource-show-usage-button resource="$ctrl.offering.marketplace_resource_uuid"></marketplace-resource-show-usage-button>'+
      '</span>');

    extensionPointService.register('resource-details-button',
      '<span ng-if="$ctrl.resource.marketplace_resource_uuid">'+
        '<marketplace-plan-details-button resource="$ctrl.resource.marketplace_resource_uuid"></marketplace-plan-details-button>'+
      '</span>');

    extensionPointService.register('offering-details-button',
      '<span ng-if="$ctrl.offering.marketplace_resource_uuid">'+
        '<marketplace-plan-details-button resource="$ctrl.offering.marketplace_resource_uuid"></marketplace-plan-details-button>'+
      '</span>');
  }
}
