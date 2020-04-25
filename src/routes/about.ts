import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

export const states: StateDeclaration[] = [
  {
    name: 'tos',
    url: '/tos/',
    abstract: true,
    component: withStore(AnonymousLayout),
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
    component: withStore(AnonymousLayout),
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
    component: withStore(AnonymousLayout),
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

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
