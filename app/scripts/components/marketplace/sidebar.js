// @ngInject
export default function registerSidebarExtension(SidebarExtensionService, currentStateService) {
  SidebarExtensionService.register('customer', () => {
    return currentStateService.getCustomer().then(customer => {
      if (customer && customer.is_service_provider) {
        return [
          {
            label: gettext('Marketplace offerings'),
            icon: 'fa-file-alt',
            link: 'marketplace-vendor-offerings({uuid: $ctrl.context.customer.uuid})',
            feature: 'marketplace',
          }
        ];
      } else {
        return [];
      }
    });
  });
}
