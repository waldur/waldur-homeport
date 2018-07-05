// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('customer', () => {
    return [
      {
        label: gettext('Marketplace offerings'),
        icon: 'fa-file-alt',
        link: 'marketplace-vendor-offerings({uuid: $ctrl.context.customer.uuid})',
        feature: 'marketplace',
      }
    ];
  });
}
