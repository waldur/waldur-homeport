import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';

const CallManagementPage = lazyComponent(
  () => import('./call-management/CallManagementPage'),
  'CallManagementPage',
);

const PublicCallsPage = lazyComponent(
  () => import('./PublicCallsPage'),
  'PublicCallsPage',
);

const PublicCallDetailsContainer = lazyComponent(
  () => import('./details/PublicCallDetailsContainer'),
  'PublicCallDetailsContainer',
);

const CallUpdateContainer = lazyComponent(
  () => import('./update/CallUpdateContainer'),
  'CallUpdateContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'organization.call-management',
    url: 'call-management/',
    component: CallManagementPage,
    data: {
      feature: 'marketplace.show_call_management_functionality',
      breadcrumb: () => translate('Call management'),
    },
  },
  {
    name: 'protected-call-update',
    url: 'call-management/:call_uuid/',
    component: CallUpdateContainer,
    parent: 'organization',
  },
  {
    name: 'public-calls-user',
    url: 'calls/',
    component: PublicCallsPage,
    parent: 'profile',
    data: {
      hideProjectSelector: true,
    },
  },
  {
    name: 'public.public-calls',
    url: '/calls/',
    component: PublicCallsPage,
    data: {
      hideProjectSelector: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'public.proposal-public-call',
    url: '/calls/:uuid/',
    component: PublicCallDetailsContainer,
    data: {
      hideProjectSelector: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
];
