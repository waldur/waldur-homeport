// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', () => {
    return [
      {
        label: gettext('JIRA projects'),
        icon: 'fa-list-alt',
        link: 'project.resources.jira-projects({uuid: $ctrl.context.project.uuid})',
        feature: 'jira',
        parent: 'resources',
        countFieldKey: 'jira-projects',
        index: 1100,
      }
    ];
  });
}
