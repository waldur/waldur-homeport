import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport, isOwnerOrStaff } from '@waldur/workspace/selectors';

const isOrganisationMemberOrStaffOrSupport = (state) =>
  isOwnerOrStaff(state) || isStaffOrSupport(state);

export const states: StateDeclaration[] = [
  {
    name: 'project.openportal-reports',
    url: 'openportal-reports/',
    component: lazyComponent(() =>
      import('./reports/OpenPortalReportsTab').then((m) => ({
        default: m.OpenPortalReportsTab,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage report'),
      priority: 105,
      permissions: [isOrganisationMemberOrStaffOrSupport],
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'organization-openportal-reports',
    url: 'openportal-reports/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./reports/OrganisationReportsTab').then((m) => ({
        default: m.OrganisationReportsTab,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage report'),
      priority: 105,
      permissions: [isOrganisationMemberOrStaffOrSupport],
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'support-openportal-usage',
    url: 'openportal-usage/',
    parent: 'support',
    component: lazyComponent(() =>
      import('./reports/SystemUsageTab').then((m) => ({
        default: m.SystemUsageTab,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage report'),
      priority: 101,
      permissions: [isStaffOrSupport],
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'organization-openportal-allocation',
    url: 'openportal-allocation/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./reports/OrganisationAllocationTab').then((m) => ({
        default: m.OrganisationAllocationTab,
      })),
    ),
    data: {
      breadcrumb: () => translate('Allocation summary'),
      priority: 106,
      permissions: [isOrganisationMemberOrStaffOrSupport],
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },

  {
    name: 'support.access-for-email',
    url: 'access-for-email/',
    component: lazyComponent(() =>
      import('./AccessForEmail').then((module) => ({
        default: module.AccessForEmail,
      })),
    ),
    data: {
      breadcrumb: () => translate('Check user access'),
      priority: 102,
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
];
