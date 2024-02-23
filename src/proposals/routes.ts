import { UIView } from '@uirouter/react';

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

const CallRoundPage = lazyComponent(
  () => import('./round/CallRoundPage'),
  'CallRoundPage',
);

const ProposalCreatePage = lazyComponent(
  () => import('./proposal/create/ProposalCreatePage'),
  'ProposalCreatePage',
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
    abstract: true,
    component: UIView,
    parent: 'organization',
  },
  {
    name: 'protected-call-update.details',
    url: '',
    component: CallUpdateContainer,
  },
  {
    name: 'protected-call-update.round',
    url: 'round/:round_uuid/',
    component: CallRoundPage,
  },

  // Public calls
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
    name: 'public-calls',
    url: '/calls/',
    abstract: true,
    component: UIView,
    parent: 'public',
  },
  {
    name: 'public-calls.list-public',
    url: '',
    component: PublicCallsPage,
    data: {
      hideProjectSelector: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'public-calls.details',
    url: ':uuid/',
    component: PublicCallDetailsContainer,
    data: {
      hideProjectSelector: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'public-calls.create-proposal',
    url: ':uuid/round/:round_uuid/create-proposal/',
    component: ProposalCreatePage,
    data: {
      hideProjectSelector: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
];
