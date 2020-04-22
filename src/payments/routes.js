import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

// @ngInject
export default function paymentRoutes($stateProvider) {
  $stateProvider
    .state('payment', {
      url: '/payment/',
      abstract: true,
      component: withStore(AnonymousLayout),
      data: {
        bodyClass: 'old',
        auth: true,
      },
    })

    .state('payment.approve', {
      url: 'approve/',
      template: '<payment-approve></payment-approve>',
      data: {
        pageTitle: gettext('Approve payment'),
      },
    })

    .state('payment.cancel', {
      url: 'cancel/',
      template: '<payment-cancel></payment-cancel>',
      data: {
        pageTitle: gettext('Cancel payment'),
      },
    });
}
