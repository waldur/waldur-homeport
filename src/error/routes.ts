import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const AnonymousLayout = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AnonymousLayout" */ '@waldur/navigation/AnonymousLayout'
    ),
  'AnonymousLayout',
);
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
    component: AnonymousLayout,
    abstract: true,
    data: {
      bodyClass: 'old',
    },
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
