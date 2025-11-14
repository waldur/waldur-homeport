import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaff } from '@waldur/workspace/selectors';

export const states: StateDeclaration[] = [
  {
    name: 'admin-organization-checklist-management',
    url: 'organization-checklist-management/',
    parent: 'admin-organizations',
    component: lazyComponent(() =>
      import('@waldur/marketplace-checklist/ChecklistManagementTable').then(
        (module) => ({
          default: module.ChecklistManagementTable,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Checklist management'),
      permissions: [isStaff],
      priority: 100,
    },
  },
];
