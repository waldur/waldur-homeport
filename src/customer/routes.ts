import { StateDeclaration } from '@waldur/core/types';
import { PaymentProfileCreateContainer } from '@waldur/customer/payment-profiles/PaymentProfileCreateContainer';
import { gettext } from '@waldur/i18n';
import { ProjectsList } from '@waldur/project/ProjectsList';
import { withStore } from '@waldur/store/connect';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';
import { ProjectCreateContainer } from '../project/ProjectCreateContainer';

import { CustomerDashboardContainer } from './dashboard/CustomerDashboardContainer';
import { CustomerManage } from './details/CustomerManage';
import { CustomerTeam } from './team/CustomerTeam';
import { loadCustomer, CustomerController } from './utils';
import { CustomerEventsView } from './workspace/CustomerEventsList';
import { CustomerIssuesList } from './workspace/CustomerIssuesList';

export const states: StateDeclaration[] = [
  {
    name: 'organization',
    url: '/organizations/:uuid/',
    abstract: true,
    data: {
      auth: true,
      workspace: WOKSPACE_NAMES.organization,
    },
    template: '<customer-workspace></customer-workspace>',
    resolve: {
      currentCustomer: loadCustomer,
    },
    controller: CustomerController,
  },

  {
    name: 'organization.dashboard',
    url: 'dashboard/',
    component: withStore(CustomerDashboardContainer),
    data: {
      pageTitle: gettext('Dashboard'),
      pageClass: 'gray-bg',
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'organization.details',
    url: 'events/',
    component: withStore(CustomerEventsView),
    data: {
      pageTitle: gettext('Audit logs'),
    },
  },

  {
    name: 'organization.issues',
    url: 'issues/',
    component: withStore(CustomerIssuesList),
    data: {
      feature: 'support',
      pageTitle: gettext('Issues'),
    },
  },

  {
    name: 'organization.projects',
    url: 'projects/',
    component: withStore(ProjectsList),
    data: {
      pageTitle: gettext('Projects'),
    },
  },

  {
    name: 'organization.team',
    url: 'team/',
    component: withStore(CustomerTeam),
    data: {
      pageTitle: gettext('Team'),
    },
  },

  {
    name: 'organization.manage',
    url: 'manage/',
    component: withStore(CustomerManage),
    data: {
      pageTitle: gettext('Manage organization'),
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'payment-profile-create',
    url: 'payment-profile-create/',
    parent: 'organization',
    component: withStore(PaymentProfileCreateContainer),
    data: {
      pageTitle: gettext('Add payment profile'),
    },
  },

  {
    name: 'organization.createProject',
    url: 'createProject/',
    component: withStore(ProjectCreateContainer),
    data: {
      pageTitle: gettext('Create project'),
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
