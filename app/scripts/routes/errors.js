// @ngInject
export default function errorRoutes($stateProvider) {
  $stateProvider
    .state('errorPage', {
      url: '/error/',
      templateUrl: 'views/partials/base.html',
      abstract: true,
      data: {
        bodyClass: 'old'
      }
    })

    .state('errorPage.notFound', {
      url: '404/',
      views: {
        appContent: {
          templateUrl: 'views/404.html',
        },
        appHeader: {
          templateUrl: 'views/partials/site-header.html',
        }
      },
      data: {
        pageTitle: 'Page not found'
      }
    })

    .state('errorPage.limitQuota', {
      url: '403/',
      views: {
        appContent: {
          templateUrl: 'views/403.html',
        },
        appHeader: {
          templateUrl: 'views/partials/site-header.html',
        }
      },
      data: {
        pageTitle: 'Quota limit exceeded'
      }
    });
}
