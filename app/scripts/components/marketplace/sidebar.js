// @ngInject
export default function registerSidebarExtension(SidebarExtensionService, currentStateService) {
  SidebarExtensionService.register('customer', () => {
    return currentStateService.getCustomer().then(customer => {
      if (customer && customer.is_service_provider) {
        return [
          {
            label: gettext('Marketplace offerings'),
            icon: 'fa-file',
            link: 'marketplace-vendor-offerings({uuid: $ctrl.context.customer.uuid})',
            feature: 'marketplace',
          }
        ];
      } else {
        return [];
      }
    });
  });

  SidebarExtensionService.register('project', () => {
    return [
      {
        key: 'marketplace',
        icon: 'fa-shopping-cart',
        label: gettext('Marketplace'),
        feature: 'marketplace',
        link: 'marketplace-landing({uuid: $ctrl.context.project.uuid})',
        index: 210,
      },
      {
        label: gettext('Marketplace orders'),
        icon: 'fa-folder-open',
        link: 'marketplace-order-list({uuid: $ctrl.context.project.uuid})',
        feature: 'marketplace',
        index: 220,
      }
    ];
  });
}
