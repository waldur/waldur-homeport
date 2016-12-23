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
      views: {
        appHeader: {
          templateUrl: 'views/partials/site-header.html',
        },
        appContent: {
          templateUrl: 'views/payment/approve.html',
        }
      },
      data: {
        pageTitle: 'Approve payment'
      }
    })

    .state('payment.cancel', {
      url: 'cancel/',
      views: {
        appHeader: {
          templateUrl: 'views/partials/site-header.html',
        },
        appContent: {
          templateUrl: 'views/payment/cancel.html',
        }
      },
      data: {
        pageTitle: 'Cancel payment'
      }
    });
}
