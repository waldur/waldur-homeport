// @ngInject
export default function expertRequestsRoutes($stateProvider) {
  $stateProvider
    .state('appstore.expert', {
      url: 'experts/:category/',
      template: '<expert-request-create></expert-request-create>',
      data: {
        category: 'experts',
        pageTitle: gettext('Experts'),
        sidebarState: 'project.resources',
        feature: 'experts',
      }
    })

    .state('expertRequestDetails', {
      url: '/experts/:uuid/',
      template: '<expert-request-details/>',
      feature: 'experts',
    });
}
