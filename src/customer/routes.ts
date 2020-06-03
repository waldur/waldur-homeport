import { StateDeclaration } from '@waldur/core/types';
import { PaymentProfileCreateContainer } from '@waldur/customer/payment-profiles/PaymentProfileCreateContainer';
import { gettext } from '@waldur/i18n';
import { ProjectsList } from '@waldur/project/ProjectsList';

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
    component: CustomerDashboardContainer,
    data: {
      pageTitle: gettext('Dashboard'),
      pageClass: 'gray-bg',
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'organization.details',
    url: 'events/',
    component: CustomerEventsView,
    data: {
      pageTitle: gettext('Audit logs'),
    },
  },

  {
    name: 'organization.issues',
    url: 'issues/',
    component: CustomerIssuesList,
    data: {
      feature: 'support',
      pageTitle: gettext('Issues'),
    },
  },

  {
    name: 'organization.projects',
    url: 'projects/',
    component: ProjectsList,
    data: {
      pageTitle: gettext('Projects'),
    },
  },

  {
    name: 'organization.team',
    url: 'team/',
    component: CustomerTeam,
    data: {
      pageTitle: gettext('Team'),
    },
  },

  {
    name: 'organization.manage',
    url: 'manage/',
    component: CustomerManage,
    data: {
      pageTitle: gettext('Manage organization'),
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'payment-profile-create',
    url: 'payment-profile-create/',
    parent: 'organization',
    component: PaymentProfileCreateContainer,
    data: {
      pageTitle: gettext('Add payment profile'),
    },
  },

  {
    name: 'organization.createProject',
    url: 'createProject/',
    component: ProjectCreateContainer,
    data: {
      pageTitle: gettext('Create project'),
    },
  },
];
