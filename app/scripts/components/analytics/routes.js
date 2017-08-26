import moduleLoader from './loader';

// @ngInject
export default function analyticsRoutes($stateProvider) {
  $stateProvider
    .state('organization.analysis', {
      url: '',
      abstract: true,
      template: '<ui-view/>',
      resolve: {
        module: moduleLoader
      }
    })

    .state('organization.analysis.cost', {
      url: 'cost-analysis/',
      template: '<cost-analysis></cost-analysis>',
      data: {
        pageTitle: gettext('Cost analysis')
      }
    })

    .state('organization.analysis.resources', {
      url: 'resource-usage/',
      template: '<resource-analysis/>',
      data: {
        pageClass: 'gray-bg',
        pageTitle: gettext('Resource usage')
      }
    });
}
