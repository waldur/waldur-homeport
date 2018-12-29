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
      template: '<payment-approve></payment-approve>',
      data: {
        pageTitle: gettext('Approve payment')
      }
    })

    .state('payment.cancel', {
      url: 'cancel/',
      template: '<payment-cancel></payment-cancel>',
      data: {
        pageTitle: gettext('Cancel payment')
      }
    });
}
