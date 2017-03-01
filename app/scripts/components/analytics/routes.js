// @ngInject
export default function analyticsRoutes($stateProvider) {
  $stateProvider
    .state('organization.analysis', {
      url: '',
      abstract: true,
      template: '<ui-view/>'
    })

    .state('organization.analysis.cost', {
      url: 'cost-analysis/',
      template: '<cost-analysis></cost-analysis>',
      data: {
        pageTitle: 'Cost analysis'
      }
    })

    .state('organization.analysis.resources', {
      url: 'resource-usage/',
      template: '<resource-analysis/>',
      data: {
        pageClass: 'gray-bg',
        pageTitle: 'Resource usage'
      }
    });
}
