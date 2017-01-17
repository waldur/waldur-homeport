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
          template: '<error404></error404>',
        },
        appHeader: {
          template: '<site-header></site-header>',
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
          template: '<error403></error403>',
        },
        appHeader: {
          template: '<site-header></site-header>',
        }
      },
      data: {
        pageTitle: 'Quota limit exceeded'
      }
    });
}
