import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
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
      permissions: [isStaff, isExperimentalUiComponentsVisible],
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
];
