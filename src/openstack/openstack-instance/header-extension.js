// @ngInject
export default function registerExtensionPoint(extensionPointService) {
  extensionPointService.register('resource-details-button',
    '<openstack-instance-tenant-button resource="$ctrl.resource"></openstack-instance-tenant-button>'
  );
}
