import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import {
  UserAgreementComponent,
  USER_AGREEMENT_TYPES,
} from '@waldur/UserAgreementComponent';

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
  useTitle(translate('Terms of Service'));
  return (
    <UserAgreementComponent
      agreement_type={USER_AGREEMENT_TYPES.terms_of_service}
      title={'Terms of Service'}
    />
  );
};

const AboutPage = () => {
  useTitle(translate('About'));
  return <TemplateComponent url="views/about/index.html" />;
};

const PrivacyPage = () => {
  useTitle(translate('Privacy Policy'));
  return (
    <UserAgreementComponent
      agreement_type={USER_AGREEMENT_TYPES.privacy_policy}
      title={'Privacy Policy'}
    />
  );
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
    component: PrivacyPage,
  },
];
