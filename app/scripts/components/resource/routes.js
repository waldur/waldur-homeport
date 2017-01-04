// @ngInject
export default function resourceRoutes($stateProvider) {
  $stateProvider
    .state('resources', {
      url: '/resources/',
      abstract: true,
      template: '<ui-view></ui-view>',
      data: {
        auth: true,
        workspace: 'project',
        sidebarState: 'project.resources',
        pageClass: 'gray-bg'
      }
    })

    .state('resources.details', {
      url: ':resource_type/:uuid',
      template: '<resource-header></resource-header>',
    });
}
