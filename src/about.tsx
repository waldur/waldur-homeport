import { StateDeclaration } from '@waldur/core/types';

import { lazyComponent } from './core/lazyComponent';
import { useTitle } from './navigation/title';
import { TemplateComponent } from './TemplateComponent';

const AnonymousLayout = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AnonymousLayout" */ '@waldur/navigation/AnonymousLayout'
    ),
  'AnonymousLayout',
);

const TosPage = () => {
  useTitle('Terms of service');
  return <TemplateComponent url="views/tos/index.html" />;
};

const FreeipaPage = () => {
  useTitle('Terms of service');
  return <TemplateComponent url="views/tos/freeipa.html" />;
};

const AboutPage = () => {
  useTitle('About');
  return <TemplateComponent url="views/about/index.html" />;
};

const PricacyPage = () => {
  useTitle('Privacy policy');
  return <TemplateComponent url="views/policy/privacy.html" />;
};

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
    component: TosPage,
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'tos.freeipa',
    url: 'freeipa-terms/',
    component: FreeipaPage,
    data: {
      bodyClass: 'old',
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
    component: AboutPage,
    data: {
      bodyClass: 'old',
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
    component: PricacyPage,
    data: {
      bodyClass: 'old',
    },
  },
];
