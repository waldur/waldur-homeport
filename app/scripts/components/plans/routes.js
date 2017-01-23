// @ngInject
export default function planRoutes($stateProvider) {
  $stateProvider
    .state('agreement', {
      url: '/agreement/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
      data: {
        bodyClass: 'old',
        auth: true,
      }
    })

    .state('agreement.approve', {
      url: 'approve/',
      views: {
        appHeader: {
          template: '<site-header></site-header>',
        },
        appContent: {
          template: '<plan-agreement-approve/>',
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
          templateUrl: '<plan-agreement-cancel/>',
        }
      }
    });
}
