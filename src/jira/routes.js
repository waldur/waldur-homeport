// @ngInject
export default function jiraRoutes($stateProvider) {
  $stateProvider
    .state('project.resources.jira-projects', {
      url: 'jira-projects/',
      template: '<jira-projects-list></jira-projects-list>',
      data: {
        pageTitle: gettext('Service desk projects')
      }
    })

    .state('appstore.jira-project', {
      url: 'jira-project/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'jiraProject',
        pageTitle: gettext('Service desk project'),
        sidebarState: 'project.resources',
        feature: 'jira',
      }
    });
}
