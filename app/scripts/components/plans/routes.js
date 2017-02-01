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
      template: '<plan-agreement-approve/>',
    })

    .state('agreement.cancel', {
      url: 'cancel/',
      template: '<plan-agreement-cancel/>',
    });
}
