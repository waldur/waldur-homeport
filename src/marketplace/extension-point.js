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
  }
}
