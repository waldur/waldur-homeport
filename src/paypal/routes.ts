import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const Layout = lazyComponent(
  () => import('@waldur/navigation/Layout'),
  'Layout',
);
const PaymentApprove = lazyComponent(
  () => import('./PaymentApprove'),
  'PaymentApprove',
);
const PaymentCancel = lazyComponent(
  () => import('./PaymentCancel'),
  'PaymentCancel',
);

export const states: StateDeclaration[] = [
  {
    name: 'payment',
    url: '/payment/',
    abstract: true,
    component: Layout,
    data: {
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
