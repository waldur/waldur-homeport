import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures, MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import {
  isStaffOrSupport,
  isOwnerOrStaff,
  isOwnerOrStaffOrReader,
} from '@/workspace/selectors';

const isOrganisationMemberOrStaffOrSupport = (state) =>
  isOwnerOrStaff(state) || isStaffOrSupport(state);

// The remote project pages are read-only views of organisation data, so
// organisation readers belong here too, alongside owners, staff and support.
const canViewRemoteProjects = (state) =>
  isOrganisationMemberOrStaffOrSupport(state) || isOwnerOrStaffOrReader(state);

// Usage reports, the allocation summary and the access check serve a portal
// that sends projects as well as one that receives them, so they show while
// the portal plays either side. With both sides off it plays neither.
const isOpenPortalInUse = () =>
  Boolean(ENV.plugins.WALDUR_OPENPORTAL?.ENABLED) &&
  (isFeatureVisible(CustomerFeatures.show_openportal_remote_projects) ||
    isFeatureVisible(MarketplaceFeatures.show_managed_projects));

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
      permissions: [isOrganisationMemberOrStaffOrSupport, isOpenPortalInUse],
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
      permissions: [isOrganisationMemberOrStaffOrSupport, isOpenPortalInUse],
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
      permissions: [isStaffOrSupport, isOpenPortalInUse],
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
      permissions: [isOrganisationMemberOrStaffOrSupport, isOpenPortalInUse],
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
      permissions: [isOpenPortalInUse],
    },
  },
  {
    name: 'organization-remote-projects',
    url: 'remote-projects/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./remote-projects/RemoteProjectsList').then((module) => ({
        default: module.RemoteProjectsList,
      })),
    ),
    data: {
      feature: CustomerFeatures.show_openportal_remote_projects,
      breadcrumb: () => translate('Remote Projects'),
      priority: 107,
      permissions: [
        canViewRemoteProjects,
        () => ENV.plugins.WALDUR_OPENPORTAL?.ENABLED,
      ],
    },
  },
  {
    name: 'organization-remote-project-detail',
    url: 'remote-projects/:remoteProjectUuid/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./remote-projects/RemoteProjectDetail').then((module) => ({
        default: module.RemoteProjectDetail,
      })),
    ),
    data: {
      feature: CustomerFeatures.show_openportal_remote_projects,
      breadcrumb: () => translate('Remote project'),
      // A detail page needs a remote project, so it is never a tab.
      skipBreadcrumb: true,
      priority: 107,
      permissions: [
        canViewRemoteProjects,
        () => ENV.plugins.WALDUR_OPENPORTAL?.ENABLED,
      ],
    },
  },
  {
    name: 'organization-remote-project-audit',
    url: 'remote-projects/:remoteProjectUuid/audit/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./remote-projects/RemoteProjectAuditLog').then((module) => ({
        default: module.RemoteProjectAuditLog,
      })),
    ),
    data: {
      feature: CustomerFeatures.show_openportal_remote_projects,
      breadcrumb: () => translate('Audit Log'),
      skipBreadcrumb: true,
      priority: 107,
      permissions: [
        canViewRemoteProjects,
        () => ENV.plugins.WALDUR_OPENPORTAL?.ENABLED,
      ],
    },
  },
  {
    name: 'organization-remote-projects-audit',
    url: 'remote-projects-audit/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./remote-projects/AllRemoteProjectsAuditLog').then((module) => ({
        default: module.AllRemoteProjectsAuditLog,
      })),
    ),
    data: {
      feature: CustomerFeatures.show_openportal_remote_projects,
      breadcrumb: () => translate('Remote Projects Audit Log'),
      priority: 107,
      permissions: [
        canViewRemoteProjects,
        () => ENV.plugins.WALDUR_OPENPORTAL?.ENABLED,
      ],
    },
  },
];
