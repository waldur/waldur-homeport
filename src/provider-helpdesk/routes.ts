import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { fetchCustomer } from '@/customer/workspace/fetchCustomer';
import { translate } from '@/i18n';
import { hasProviderRouting } from '@/issues/hooks';

// The Helpdesk workspace is a top-level organization mode (peer to Customer /
// Service provider / Call management), reachable only once the provider has an
// active helpdesk. First-time setup is a modal on the Service provider
// dashboard; gating the section here keeps the mode hidden and its URLs
// inaccessible until a helpdesk exists.
const hasActiveHelpdesk = (state) =>
  Boolean(state.workspace.customer?.has_active_helpdesk);

export const states: StateDeclaration[] = [
  {
    name: 'provider-helpdesk',
    parent: 'layout',
    url: '/provider-helpdesk/:uuid/',
    abstract: true,
    component: lazyComponent(() =>
      import('@/organization/OrganizationUIView').then((module) => ({
        default: module.OrganizationUIView,
      })),
    ),
    redirectTo: 'provider-helpdesk-overview',
    data: {
      auth: true,
      title: () => translate('Helpdesk'),
      permissions: [hasProviderRouting, hasActiveHelpdesk],
    },
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
    ],
  },
  {
    name: 'provider-helpdesk-overview',
    parent: 'provider-helpdesk',
    url: 'overview/',
    component: lazyComponent(() =>
      import('./configuration/HelpdeskOverviewPage').then((module) => ({
        default: module.HelpdeskOverviewPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Overview'),
      priority: 90,
    },
  },
  {
    name: 'provider-helpdesk-tickets',
    parent: 'provider-helpdesk',
    url: 'tickets/',
    component: lazyComponent(() =>
      import('./tickets/ProviderTicketsList').then((module) => ({
        default: module.ProviderTicketsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Tickets'),
      priority: 100,
    },
  },
  {
    name: 'provider-helpdesk-ticket-detail',
    parent: 'provider-helpdesk',
    url: 'tickets/:issue_uuid/',
    component: lazyComponent(() =>
      import('./tickets/ProviderTicketDetail').then((module) => ({
        default: module.ProviderTicketDetail,
      })),
    ),
    data: {
      breadcrumb: () => translate('Ticket'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'provider-helpdesk-team',
    parent: 'provider-helpdesk',
    url: 'team/',
    component: lazyComponent(() =>
      import('./team/ProviderTeamList').then((module) => ({
        default: module.ProviderTeamList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Team'),
      priority: 110,
    },
  },
  {
    name: 'provider-helpdesk-configuration',
    parent: 'provider-helpdesk',
    url: 'configuration/',
    component: lazyComponent(() =>
      import('./configuration/HelpdeskConfigPage').then((module) => ({
        default: module.HelpdeskConfigPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Configuration'),
      priority: 120,
    },
  },
  {
    name: 'provider-helpdesk-canned-responses',
    parent: 'provider-helpdesk',
    url: 'canned-responses/',
    component: lazyComponent(() =>
      import('./canned-responses/CannedResponsesList').then((module) => ({
        default: module.CannedResponsesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Canned responses'),
      priority: 130,
    },
  },
];
