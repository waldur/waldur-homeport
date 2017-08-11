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
      template: '<expert-requests-customer-list/>',
      data: {
        pageTitle: gettext('Experts'),
        feature: 'experts',
      }
    })

    .state('organization.expertRequestDetails', {
      url: 'experts/:requestId/',
      template: '<expert-request-details/>',
      data: {
        pageTitle: gettext('Experts'),
        feature: 'experts',
        pageClass: 'gray-bg',
      }
    })

    .state('project.resources.experts', {
      url: 'experts/',
      template: '<expert-requests-project-list/>',
      data: {
        pageTitle: gettext('Experts'),
        feature: 'experts'
      }
    })

    .state('project.expertRequestDetails', {
      url: 'experts/:requestId/',
      template: '<expert-request-details/>',
      data: {
        feature: 'experts',
        pageTitle: gettext('Expert request details'),
        pageClass: 'gray-bg',
      }
    });
}
