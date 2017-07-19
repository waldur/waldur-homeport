// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('customer', () => {
    return [
      {
        label: gettext('Expert requests'),
        icon: 'fa-vcard',
        link: 'organization.experts({uuid: $ctrl.context.customer.uuid})',
        feature: 'experts',
        index: 1100,
      }
    ];
  });

  SidebarExtensionService.register('project', () => {
    return [
      {
        link: 'project.resources.experts({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-vcard',
        label: gettext('Expert requests'),
        feature: 'experts',
        parent: 'resources',
        index: 900,
      }
    ];
  });
}
