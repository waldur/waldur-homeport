// @ngInject
function headerController($scope, authService, ENV) {
  $scope.logout = authService.logout;
  $scope.headerLogo = ENV.loginLogo;
}

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
          templateUrl: 'views/partials/site-header.html',
          controller: headerController
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
          templateUrl: 'views/partials/site-header.html',
          controller: headerController
        }
      },
      data: {
        pageTitle: 'Quota limit exceeded'
      }
    });
}
