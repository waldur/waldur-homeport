import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { AdminContainer } from './workspace/AdminContainer';
import {
  CustomerContainer,
  fetchCustomer,
} from './workspace/CustomerWorkspace';
import { ReportingContainer } from './workspace/ReportingContainer';

const ProjectsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectsList" */ '@waldur/project/ProjectsList'
    ),
  'ProjectsList',
);
const ProjectCreateRequestsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectCreateRequestsList" */ '@waldur/marketplace-flows/ProjectCreateRequestsList'
    ),
  'ProjectCreateRequestsList',
);
const ResourceCreateRequestsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceCreateRequestsList" */ '@waldur/marketplace-flows/ResourceCreateRequestsList'
    ),
  'ResourceCreateRequestsList',
);
const ProjectCreateContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectCreateContainer" */ '../project/ProjectCreateContainer'
    ),
  'ProjectCreateContainer',
);
const PaymentProfileCreateContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PaymentProfileCreateContainer" */ '@waldur/customer/payment-profiles/PaymentProfileCreateContainer'
    ),
  'PaymentProfileCreateContainer',
);
const CustomerDashboard = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerDashboard" */ './dashboard/CustomerDashboard'
    ),
  'CustomerDashboard',
);
const CustomerManage = lazyComponent(
  () =>
    import(/* webpackChunkName: "CustomerManage" */ './details/CustomerManage'),
  'CustomerManage',
);
const CustomerPayments = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerPayments" */ './details/CustomerPayments'
    ),
  'CustomerPayments',
);
const CustomerUsersTab = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerUsersTab" */ './team/CustomerUsersTab'
    ),
  'CustomerUsersTab',
);
const InvitationsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "InvitationsList" */ '../invitations/InvitationsList'
    ),
  'InvitationsList',
);
const GroupInvitationsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "GroupInvitationsList" */ '../invitations/GroupInvitationsList'
    ),
  'GroupInvitationsList',
);
const CustomerPermissionsLogList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerPermissionsLogList" */ './team/CustomerPermissionsLogList'
    ),
  'CustomerPermissionsLogList',
);
const CustomerPermissionsReviewList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerPermissionsReviewList" */ './team/CustomerPermissionsReviewList'
    ),
  'CustomerPermissionsReviewList',
);

const OfferingPermissionsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingPermissionsList" */ './team/OfferingPermissionsList'
    ),
  'OfferingPermissionsList',
);

const CustomerEventsView = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerEventsList" */ './workspace/CustomerEventsList'
    ),
  'CustomerEventsView',
);
const CustomerIssuesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerIssuesList" */ './workspace/CustomerIssuesList'
    ),
  'CustomerIssuesList',
);

export const states: StateDeclaration[] = [
  {
    name: 'organization',
    url: '/organizations/:uuid/',
    abstract: true,
    data: {
      auth: true,
      workspace: ORGANIZATION_WORKSPACE,
    },
    parent: 'layout',
    component: CustomerContainer,
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
    ],
  },

  {
    name: 'reporting',
    url: '/reporting/',
    abstract: true,
    parent: 'layout',
    component: ReportingContainer,
  },

  {
    name: 'admin',
    url: '/admin/',
    abstract: true,
    parent: 'layout',
    component: AdminContainer,
  },

  {
    name: 'organization.dashboard',
    url: 'dashboard/',
    component: CustomerDashboard,
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
  },

  {
    name: 'organization.projects',
    url: 'projects/',
    component: ProjectsList,
  },

  {
    name: 'organization.project-requests',
    url: 'project-requests/',
    component: ProjectCreateRequestsList,
  },

  {
    name: 'organization.resource-requests',
    url: 'project-requests/',
    component: ResourceCreateRequestsList,
  },

  {
    name: 'organization.users',
    url: 'users/',
    component: CustomerUsersTab,
  },

  {
    name: 'organization.invitations',
    url: 'invitations/',
    component: InvitationsList,
  },

  {
    name: 'organization.group-invitations',
    url: 'group-invitations/',
    component: GroupInvitationsList,
  },

  {
    name: 'organization.permissions-log',
    url: 'permissions-log/',
    component: CustomerPermissionsLogList,
  },

  {
    name: 'organization.permissions-reviews',
    url: 'permissions-reviews/',
    component: CustomerPermissionsReviewList,
  },

  {
    name: 'organization.offering-permissions',
    url: 'offering-permissions/',
    component: OfferingPermissionsList,
  },

  {
    name: 'organization.manage',
    url: 'manage/',
    component: CustomerManage,
  },

  {
    name: 'organization.payments',
    url: 'payments/',
    component: CustomerPayments,
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
