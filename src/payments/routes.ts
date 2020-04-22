import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

export const states = [
  {
    name: 'payment',
    url: '/payment/',
    abstract: true,
    component: withStore(AnonymousLayout),
    data: {
      bodyClass: 'old',
      auth: true,
    },
  },

  {
    name: 'payment.approve',
    url: 'approve/',
    template: '<payment-approve></payment-approve>',
    data: {
      pageTitle: gettext('Approve payment'),
    },
  },

  {
    name: 'payment.cancel',
    url: 'cancel/',
    template: '<payment-cancel></payment-cancel>',
    data: {
      pageTitle: gettext('Cancel payment'),
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
