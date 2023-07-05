import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

const ReportingDashboard = lazyComponent(
  () => import('./dashboard/ReportingDashboard'),
  'ReportingDashboard',
);

export const states: StateDeclaration[] = [
  {
    name: 'reporting',
    url: '/reporting/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Reporting'),
      permissions: [isStaffOrSupport],
      hideProjectSelector: true,
    },
  },
  {
    name: 'reporting-dashboard',
    url: '',
    parent: 'reporting',
    component: ReportingDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
];
