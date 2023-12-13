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
    name: 'public-proposals-project',
    url: 'proposals/',
    component: ProposalPublicCallsPage,
    parent: 'project',
  },
  {
    name: 'public-proposals-customer',
    url: 'proposals/',
    component: ProposalPublicCallsPage,
    parent: 'organization',
  },
  {
    name: 'public-proposals-user',
    url: 'proposals/',
    component: ProposalPublicCallsPage,
    parent: 'profile',
  },
  {
    name: 'public.public-proposals',
    url: '/proposals/',
    component: ProposalPublicCallsPage,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
  },
];
