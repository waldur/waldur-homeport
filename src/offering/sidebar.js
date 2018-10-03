// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', () => {
    return [
      {
        link: 'project.resources.offerings({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-cog',
        label: gettext('Requests'),
        feature: 'offering.list',
        index: 500,
        countFieldKey: 'offerings',
        parent: 'resources',
      },
      {
        link: 'project.resources.oracle({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-database',
        label: gettext('Oracle'),
        feature: 'oracle',
        index: 510,
        parent: 'resources',
      },
    ];
  });
}
