import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';

import { lazyComponent } from './core/lazyComponent';

const AnonymousLayout = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AnonymousLayout" */ '@waldur/navigation/AnonymousLayout'
    ),
  'AnonymousLayout',
);

export const states: StateDeclaration[] = [
  {
    name: 'tos',
    url: '/tos/',
    abstract: true,
    component: AnonymousLayout,
  },

  {
    name: 'tos.index',
    url: '',
    templateUrl: 'views/tos/index.html',
    data: {
      bodyClass: 'old',
      pageTitle: gettext('Terms of service'),
    },
  },

  {
    name: 'tos.freeipa',
    url: 'freeipa-terms/',
    templateUrl: 'views/tos/freeipa.html',
    data: {
      bodyClass: 'old',
      pageTitle: gettext('Terms of service'),
      feature: 'freeipa',
    },
  },

  {
    name: 'about',
    url: '/about/',
    abstract: true,
    component: AnonymousLayout,
  },

  {
    name: 'about.index',
    url: '',
    templateUrl: 'views/about/index.html',
    data: {
      bodyClass: 'old',
      pageTitle: gettext('About'),
    },
  },

  {
    name: 'policy',
    url: '/policy/',
    abstract: true,
    component: AnonymousLayout,
  },

  {
    name: 'policy.privacy',
    url: 'privacy/',
    templateUrl: 'views/policy/privacy.html',
    data: {
      bodyClass: 'old',
      pageTitle: gettext('Privacy policy'),
    },
  },
];
