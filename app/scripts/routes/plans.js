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
          template: '<site-header></site-header>',
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
          template: '<site-header></site-header>',
        },
        appContent: {
          templateUrl: 'views/agreement/cancel.html',
        }
      }
    });
}
