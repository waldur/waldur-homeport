// @ngInject
export default function appstoreRoutes($stateProvider) {
  $stateProvider
    .state('appstore', {
      url: '/appstore/',
      abstract: true,
      template: '<appstore-header></appstore-header>',
      data: {
        auth: true,
        pageTitle: 'Service store',
        workspace: 'project',
        pageClass: 'gray-bg'
      }
    })

    .state('appstore.private_clouds', {
      url: 'private_clouds/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'private_clouds',
        pageTitle: 'Private clouds'
      }
    })

    .state('appstore.vms', {
      url: 'vms/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'vms',
        pageTitle: 'Virtual machines'
      }
    })

    .state('appstore.apps', {
      url: 'apps/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'apps',
        pageTitle: 'Applications'
      }
    })

    .state('appstore.storages', {
      url: 'storages/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'storages',
        pageTitle: 'Storages'
      }
    })

    .state('appstore.offering', {
      url: 'offering/:category/',
      template: '<appstore-offering></appstore-offering>',
    })

    .state('compare', {
      url: '/compare/',
      templateUrl: 'views/project/base.html',
      abstract: true,
      data: {
        auth: true,
        pageTitle: 'Compare flavors',
      }
    })

    .state('compare.compare', {
      url: '',
      templateUrl: 'views/compare/table.html',
    })
}
