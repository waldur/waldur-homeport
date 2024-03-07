import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';
import { SUPPORT_WORKSPACE } from '@waldur/workspace/types';

import { hasSupport } from './hooks';

const CustomerRequestContainer = lazyComponent(
  () => import('@waldur/marketplace-flows/CustomerRequestContainer'),
  'CustomerRequestContainer',
);
const SupportDashboard = lazyComponent(
  () => import('@waldur/support/dashboard/SupportDashboard'),
  'SupportDashboard',
);
const SupportFeedback = lazyComponent(
  () => import('@waldur/issues/feedback/SupportFeedback'),
  'SupportFeedback',
);
const SupportFeedbackListContainer = lazyComponent(
  () => import('@waldur/issues/feedback/SupportFeedbackListContainer'),
  'SupportFeedbackListContainer',
);
const SupportIssues = lazyComponent(
  () => import('@waldur/issues/SupportIssues'),
  'SupportIssues',
);
const IssueDetailsContainer = lazyComponent(
  () => import('./IssueDetails'),
  'IssueDetails',
);
const BroadcastList = lazyComponent(
  () => import('../broadcasts/BroadcastList'),
  'BroadcastList',
);
const BroadcastTemplateList = lazyComponent(
  () => import('../broadcasts/BroadcastTemplateList'),
  'BroadcastTemplateList',
);

export const states: StateDeclaration[] = [
  {
    name: 'support',
    url: '/support/',
    parent: 'layout',
    component: UIView,
    abstract: true,
    data: {
      auth: true,
      workspace: SUPPORT_WORKSPACE,
      title: () => translate('Support'),
      permissions: [isStaffOrSupport],
      hideProjectSelector: true,
    },
  },

  {
    name: 'support-dashboard',
    url: '',
    parent: 'support',
    component: SupportDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },

  {
    name: 'support.detail',
    url: 'issue/:issue_uuid/',
    component: IssueDetailsContainer,
    data: {
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'support.list',
    url: 'list/?{status}',
    component: SupportIssues,
    data: {
      breadcrumb: () => translate('Issues'),
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'supportFeedback',
    url: '/support/feedback/?token&evaluation',
    component: SupportFeedback,
    data: {
      permissions: [hasSupport],
    },
  },

  {
    name: 'support.feedback',
    url: 'feedback/',
    component: SupportFeedbackListContainer,
    data: {
      breadcrumb: () => translate('Feedback'),
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'support.customers-requests',
    url: 'customers-requests/',
    component: CustomerRequestContainer,
    data: {
      feature: 'support.customers_requests',
      breadcrumb: () => translate('Organization requests'),
    },
  },

  {
    name: 'support.broadcast',
    url: 'broadcast/',
    component: BroadcastList,
    data: {
      breadcrumb: () => translate('Broadcast'),
    },
  },

  {
    name: 'support.broadcast-templates',
    url: 'broadcast-templates/',
    component: BroadcastTemplateList,
    data: {
      breadcrumb: () => translate('Broadcast templates'),
    },
  },
];
