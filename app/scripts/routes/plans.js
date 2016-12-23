// @ngInject
export default function planRoutes($stateProvider) {
  $stateProvider
    .state('agreement', {
      url: '/agreement/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
      data: {
        auth: true,
        bodyClass: 'old'
      }
    })

    .state('agreement.approve', {
      url: 'agreement/',
      views: {
        appHeader: {
          templateUrl: 'views/partials/site-header.html',
        },
        appContent: {
          templateUrl: 'views/agreement/approve.html',
        }
      }
    })

    .state('agreement.cancel', {
      url: 'cancel/',
      views: {
        appHeader: {
          templateUrl: 'views/partials/site-header.html',
        },
        appContent: {
          templateUrl: 'views/agreement/cancel.html',
        }
      }
    });
}
