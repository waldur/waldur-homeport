import { StateDeclaration } from '@waldur/core/types';

import { lazyComponent } from './core/lazyComponent';
import { translate } from './i18n';
import { useTitle } from './navigation/title';
import { TemplateComponent } from './TemplateComponent';

const AnonymousLayout = lazyComponent(
  () => import('@waldur/navigation/AnonymousLayout'),
  'AnonymousLayout',
);

const TosPage = () => {
  useTitle('Terms of Service');
  return <TemplateComponent url="views/tos/index.html" />;
};

const PricacyPage = () => {
  useTitle('Privacy policy');
  return <TemplateComponent url="views/policy/privacy.html" />;
};

export const states: StateDeclaration[] = [
  {
    name: 'about',
    url: '',
    abstract: true,
    component: AnonymousLayout,
    data: {
      title: () => translate('About'),
    },
  },
  {
    name: 'about.tos',
    url: '/tos/',
    component: TosPage,
    data: {
      breadcrumb: () => translate('Terms of Service'),
    },
  },

  {
    name: 'about.privacy',
    url: '/privacy/',
    component: PricacyPage,
    data: {
      breadcrumb: () => translate('Privacy policy'),
    },
  },
];
