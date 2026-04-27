import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { translate } from '@/i18n';
import { isStaff } from '@/workspace/selectors';

export const states: StateDeclaration[] = [
  {
    name: 'admin-organization-checklist-management',
    url: 'organization-checklist-management/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('@/marketplace-checklist/ChecklistManagementTable').then(
        (module) => ({
          default: module.ChecklistManagementTable,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Checklist management'),
      permissions: [isStaff],
      priority: 504,
    },
  },
];
