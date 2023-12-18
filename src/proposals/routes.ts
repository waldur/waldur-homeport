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
      breadcrumb: () => translate('Call management'),
    },
  },

  {
    name: 'public-calls-project',
    url: 'calls/',
    component: ProposalPublicCallsPage,
    parent: 'project',
  },
  {
    name: 'public-calls-customer',
    url: 'calls/',
    component: ProposalPublicCallsPage,
    parent: 'organization',
  },
  {
    name: 'public-calls-user',
    url: 'calls/',
    component: ProposalPublicCallsPage,
    parent: 'profile',
  },
  {
    name: 'public.public-calls',
    url: '/calls/',
    component: ProposalPublicCallsPage,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
  },

  {
    name: 'public.proposal-public-call',
    url: '/proposal-public-call/:uuid/',
    component: PublicCallDetailsContainer,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
  },
];
