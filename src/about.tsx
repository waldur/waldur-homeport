import { ENV } from '@/core/config';
import { StateDeclaration } from '@/core/types';
import { translate } from '@/i18n';

import { lazyComponent } from './core/lazyComponent';

export const states: StateDeclaration[] = [
  {
    name: 'about',
    url: '',
    abstract: true,
    component: lazyComponent(() =>
      import('@/navigation/Layout').then((module) => ({
        default: module.Layout,
      })),
    ),
    data: {
      title: () => translate('About'),
    },
  },
  {
    name: 'about.tos',
    url: '/tos/',
    component: lazyComponent(() =>
      import('./about/TosPage').then((module) => ({
        default: module.TosPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Terms of Service'),
    },
  },

  {
    name: 'about.privacy',
    url: '/privacy/',
    component: lazyComponent(() =>
      import('./about/PrivacyPage').then((module) => ({
        default: module.PrivacyPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Privacy policy'),
    },
  },

  {
    name: 'about.about-us',
    url: '/about-us/',
    component: lazyComponent(() =>
      import('./about/AboutUsPage').then((module) => ({
        default: module.AboutUsPage,
      })),
    ),
    onEnter: (transition) => {
      if (!ENV.plugins.WALDUR_CORE.ABOUT_US_PAGE_ENABLED) {
        return transition.router.stateService.target(
          'errorPage.notFound',
          undefined,
          { location: false },
        );
      }
    },
    data: {
      breadcrumb: () => translate('About us'),
    },
  },
];
