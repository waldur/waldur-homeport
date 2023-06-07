import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

const AdministrationDashboard = lazyComponent(
  () => import('./dashboard/AdministrationDashboard'),
  'AdministrationDashboard',
);

export const states: StateDeclaration[] = [
  {
    name: 'admin',
    url: '/administration/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Administration'),
      permissions: [isStaffOrSupport],
      hideProjectSelector: true,
    },
  },

  {
    name: 'admin.dashboard',
    url: '',
    component: AdministrationDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
];
