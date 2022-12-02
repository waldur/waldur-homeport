import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import {
  UserAgreementComponent,
  USER_AGREEMENT_TYPES,
} from '@waldur/UserAgreementComponent';

import { lazyComponent } from './core/lazyComponent';
import { useTitle } from './navigation/title';

const Layout = lazyComponent(
  () => import('@waldur/navigation/Layout'),
  'Layout',
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
    name: 'about',
    url: '',
    abstract: true,
    component: Layout,
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
    component: PrivacyPage,
    data: {
      breadcrumb: () => translate('Privacy policy'),
    },
  },
];
