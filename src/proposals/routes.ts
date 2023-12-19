import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';

const CallManagementPage = lazyComponent(
  () => import('./call-management/CallManagementPage'),
  'CallManagementPage',
);

const ProposalPublicCallsPage = lazyComponent(
  () => import('./ProposalPublicCallsPage'),
  'ProposalPublicCallsPage',
);

const PublicCallDetailsContainer = lazyComponent(
  () => import('./details/PublicCallDetailsContainer'),
  'PublicCallDetailsContainer',
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
    name: 'public-calls-user',
    url: 'calls/',
    component: ProposalPublicCallsPage,
    parent: 'profile',
    data: {
      hideProjectSelector: true,
    },
  },
  {
    name: 'public.public-calls',
    url: '/calls/',
    component: ProposalPublicCallsPage,
    data: {
      hideProjectSelector: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },

  {
    name: 'public.proposal-public-call',
    url: '/proposal-public-call/:uuid/',
    component: PublicCallDetailsContainer,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
  },
];
