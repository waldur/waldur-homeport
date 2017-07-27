// @ngInject
export default function registerSidebarExtension(SidebarExtensionService, currentStateService) {
  SidebarExtensionService.register('customer', () => {
    return currentStateService.getCustomer().then(customer => {
      if (customer.is_expert_provider) {
        return [
          {
            label: gettext('Requests for experts'),
            icon: 'fa-vcard',
            link: 'organization.experts({uuid: $ctrl.context.customer.uuid})',
            feature: 'experts',
            index: 1100,
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
        link: 'project.resources.experts({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-vcard',
        label: gettext('Requests for experts'),
        feature: 'experts',
        parent: 'resources',
        index: 900,
      }
    ];
  });
}
