import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';

import { PaymentApprove } from './PaymentApprove';
import { PaymentCancel } from './PaymentCancel';

export const states: StateDeclaration[] = [
  {
    name: 'payment',
    url: '/payment/',
    abstract: true,
    component: AnonymousLayout,
    data: {
      bodyClass: 'old',
      auth: true,
    },
  },

  {
    name: 'payment.approve',
    url: 'approve/',
    component: PaymentApprove,
    data: {
      pageTitle: gettext('Approve payment'),
    },
  },

  {
    name: 'payment.cancel',
    url: 'cancel/',
    component: PaymentCancel,
    data: {
      pageTitle: gettext('Cancel payment'),
    },
  },
];
