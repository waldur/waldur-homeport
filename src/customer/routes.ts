import { StateDeclaration } from '@waldur/core/types';
import { PaymentProfileCreateContainer } from '@waldur/customer/payment-profiles/PaymentProfileCreateContainer';
import { ProjectsList } from '@waldur/project/ProjectsList';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { ProjectCreateContainer } from '../project/ProjectCreateContainer';

import { CustomerDashboardContainer } from './dashboard/CustomerDashboardContainer';
import { CustomerManage } from './details/CustomerManage';
import { CustomerTeam } from './team/CustomerTeam';
import { CustomerEventsView } from './workspace/CustomerEventsList';
import { CustomerIssuesList } from './workspace/CustomerIssuesList';
import { CustomerWorkspace } from './workspace/CustomerWorkspace';

export const states: StateDeclaration[] = [
  {
    name: 'organization',
    url: '/organizations/:uuid/',
    abstract: true,
    data: {
      auth: true,
      workspace: ORGANIZATION_WORKSPACE,
    },
    component: CustomerWorkspace,
  },

  {
    name: 'organization.dashboard',
    url: 'dashboard/',
    component: CustomerDashboardContainer,
    data: {
      pageClass: 'gray-bg',
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'organization.details',
    url: 'events/',
    component: CustomerEventsView,
  },

  {
    name: 'organization.issues',
    url: 'issues/',
    component: CustomerIssuesList,
    data: {
      feature: 'support',
    },
  },

  {
    name: 'organization.projects',
    url: 'projects/',
    component: ProjectsList,
  },

  {
    name: 'organization.team',
    url: 'team/',
    component: CustomerTeam,
  },

  {
    name: 'organization.manage',
    url: 'manage/',
    component: CustomerManage,
    data: {
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'payment-profile-create',
    url: 'payment-profile-create/',
    parent: 'organization',
    component: PaymentProfileCreateContainer,
  },

  {
    name: 'organization.createProject',
    url: 'createProject/',
    component: ProjectCreateContainer,
  },
];
