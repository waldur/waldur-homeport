import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

import { PaymentApprove } from './PaymentApprove';
import { PaymentCancel } from './PaymentCancel';

export const states: StateDeclaration[] = [
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
    component: withStore(PaymentApprove),
    data: {
      pageTitle: gettext('Approve payment'),
    },
  },

  {
    name: 'payment.cancel',
    url: 'cancel/',
    component: withStore(PaymentCancel),
    data: {
      pageTitle: gettext('Cancel payment'),
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
