// @ngInject
export default function jiraRoutes($stateProvider) {
  $stateProvider
    .state('project.resources.jira-projects', {
      url: 'jira-projects/',
      template: '<jira-projects-list/>',
      data: {
        pageTitle: gettext('JIRA projects')
      }
    });
}
