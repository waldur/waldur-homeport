// @ngInject
export default function offeringRoutes($stateProvider) {
  $stateProvider

  .state('appstore.offering', {
    url: 'offering/:category/',
    template: '<appstore-offering></appstore-offering>',
    data: {
      category: 'offerings',
      pageTitle: gettext('Requests'),
      sidebarState: 'project.resources',
      feature: 'offering',
    }
  })

  .state('offeringDetails', {
    url: '/offering/:uuid/',
    template: '<offering-details/>',
    feature: 'offering',
  })

  .state('project.resources.offerings', {
    url: 'offerings/',
    template: '<project-offerings-list/>',
    data: {
      pageTitle: gettext('Requests'),
      feature: 'offering'
    }
  });
}
