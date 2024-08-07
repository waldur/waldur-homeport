import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { hasSupport } from './hooks';

const SupportDashboard = lazyComponent(
  () => import('@waldur/support/dashboard/SupportDashboard'),
  'SupportDashboard',
);
const SupportFeedback = lazyComponent(
  () => import('@waldur/issues/feedback/SupportFeedback'),
  'SupportFeedback',
);
const SupportFeedbackList = lazyComponent(
  () => import('@waldur/issues/feedback/SupportFeedbackList'),
  'SupportFeedbackList',
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
const BaseEventsList = lazyComponent(
  () => import('@waldur/events/BaseEventsList'),
  'BaseEventsList',
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
      workspace: WorkspaceType.SUPPORT,
      title: () => translate('Support'),
      permissions: [isStaffOrSupport],
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
      priority: 103,
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
    component: SupportFeedbackList,
    data: {
      breadcrumb: () => translate('Feedback'),
      permissions: [isStaffOrSupport, hasSupport],
      priority: 102,
    },
  },

  {
    name: 'support.broadcast',
    url: 'broadcast/',
    component: BroadcastList,
    data: {
      breadcrumb: () => translate('Broadcast'),
      priority: 100,
    },
  },

  {
    name: 'support.broadcast-templates',
    url: 'broadcast-templates/',
    component: BroadcastTemplateList,
    data: {
      breadcrumb: () => translate('Broadcast templates'),
      priority: 101,
    },
  },

  {
    name: 'support.audit-logs',
    url: 'audit-logs/',
    component: BaseEventsList,
    data: {
      breadcrumb: () => translate('Audit logs'),
      priority: 105,
    },
  },
];
