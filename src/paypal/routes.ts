import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const AnonymousLayout = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AnonymousLayout" */ '@waldur/navigation/AnonymousLayout'
    ),
  'AnonymousLayout',
);
const PaymentApprove = lazyComponent(
  () => import(/* webpackChunkName: "PaymentApprove" */ './PaymentApprove'),
  'PaymentApprove',
);
const PaymentCancel = lazyComponent(
  () => import(/* webpackChunkName: "PaymentCancel" */ './PaymentCancel'),
  'PaymentCancel',
);

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
  },

  {
    name: 'payment.cancel',
    url: 'cancel/',
    component: PaymentCancel,
  },
];
