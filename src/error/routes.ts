import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const InvalidObjectPage = lazyComponent(
  () =>
    import(/* webpackChunkName: "InvalidObjectPage" */ './InvalidObjectPage'),
  'InvalidObjectPage',
);
const InvalidQuotaPage = lazyComponent(
  () => import(/* webpackChunkName: "InvalidQuotaPage" */ './InvalidQuotaPage'),
  'InvalidQuotaPage',
);
const InvalidRoutePage = lazyComponent(
  () => import(/* webpackChunkName: "InvalidRoutePage" */ './InvalidRoutePage'),
  'InvalidRoutePage',
);

export const states: StateDeclaration[] = [
  {
    name: 'errorPage',
    component: UIView,
    abstract: true,
  },

  {
    name: 'errorPage.notFound',
    component: InvalidObjectPage,
  },

  {
    name: 'errorPage.otherwise',
    url: '*path',
    component: InvalidRoutePage,
  },

  {
    name: 'errorPage.limitQuota',
    component: InvalidQuotaPage,
  },
];
