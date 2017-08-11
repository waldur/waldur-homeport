export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', () => {
    return [
      {
        link: 'project.resources.offerings({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-cog',
        label: gettext('Requests'),
        feature: 'offering',
        index: 500,
        countFieldKey: 'offerings',
        parent: 'resources',
      },
    ];
  });
}
