// @ngInject
export default function paymentRoutes($stateProvider) {
  $stateProvider
    .state('payment', {
      url: '/payment/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
      data: {
        bodyClass: 'old',
        auth: true
      }
    })

    .state('payment.approve', {
      url: 'approve/',
      templateUrl: 'views/payment/approve.html',
      data: {
        pageTitle: 'Approve payment'
      }
    })

    .state('payment.cancel', {
      url: 'cancel/',
      templateUrl: 'views/payment/cancel.html',
      data: {
        pageTitle: 'Cancel payment'
      }
    });
}
