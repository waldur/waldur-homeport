// @ngInject
export default function appstoreRoutes($stateProvider) {
  $stateProvider
    .state('appstore', {
      url: '/appstore/',
      abstract: true,
      templateUrl: 'views/appstore/base.html',
      data: {
        auth: true,
        pageTitle: 'Service store',
        workspace: 'project'
      }
    })

    .state('appstore.store', {
      url: ':category/',
      templateUrl: 'views/appstore/store.html',
      controller: 'AppStoreController',
      controllerAs: 'AppStore'
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
