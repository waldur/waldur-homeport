// @ngInject
export default function expertRequestsRoutes($stateProvider) {
  $stateProvider
    .state('appstore.expert', {
      url: 'experts/:category/',
      template: '<expert-request-create></expert-request-create>',
      data: {
        category: 'experts',
        pageTitle: gettext('Create expert request'),
        sidebarState: 'project.resources',
        feature: 'experts',
      }
    })

    .state('organization.experts', {
      url: 'experts/',
      template: '<expert-requests-list/>',
      data: {
        pageTitle: gettext('Expert requests list'),
        feature: 'experts'
      }
    })

    .state('project.resources.experts', {
      url: 'experts/',
      template: '<expert-requests-project-list/>',
      data: {
        pageTitle: gettext('Expert requests list'),
        feature: 'experts'
      }
    })

    .state('expertRequestDetails', {
      url: '/experts/:uuid/',
      template: '<expert-request-details/>',
      data: {
        feature: 'experts',
        pageTitle: gettext('Expert request details'),
      }
    });
}
