import { UIView } from '@uirouter/react';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { userHasCustomerPermission } from '@/customer/utils';
import { fetchCustomer } from '@/customer/workspace/fetchCustomer';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@/marketplace/constants';
import { PermissionEnum } from '@/permissions/enums';
import { isOwnerOrStaff, isStaff } from '@/workspace/selectors';

import { fetchProvider } from './resolve';

const canAccessMarketplace = (state) => {
  const hideFromEndUsers = isFeatureVisible(
    MarketplaceFeatures.hide_marketplace_from_end_users,
  );
  if (!hideFromEndUsers) {
    return true;
  }
  return isStaff(state);
};

export const states: StateDeclaration[] = [
  {
    name: 'public',
    url: '',
    abstract: true,
    component: UIView,
    parent: 'layout',
    data: {
      auth: false,
    },
  },

  {
    name: 'marketplace-offering-public',
    url: '/marketplace-provider-offering/:offering_uuid/',
    component: lazyComponent(() =>
      import('./details/DetailsPage').then((module) => ({
        default: module.OfferingDetailsPage,
      })),
    ),
    parent: 'public',
    data: {
      permissions: [canAccessMarketplace],
    },
  },

  {
    name: 'provider-offering',
    url: '',
    abstract: true,
    parent: 'marketplace-provider',
    component: lazyComponent(() =>
      import('./offerings/OfferingUIView').then((module) => ({
        default: module.OfferingUIView,
      })),
    ),
  },
  {
    name: 'provider-offering-details',
    url: '',
    abstract: true,
    parent: 'provider-offering',
    component: lazyComponent(() =>
      import('./offerings/OfferingDetailsUIView').then((module) => ({
        default: module.OfferingDetailsUIView,
      })),
    ),
  },
  {
    name: 'marketplace-offering-details',
    url: 'marketplace-provider-offering-details/:offering_uuid/?tab&customerTab',
    params: {
      tab: { dynamic: true },
      customerTab: { dynamic: true },
    },
    component: lazyComponent(() =>
      import('./offerings/details/OfferingContainer').then((module) => ({
        default: module.OfferingContainer,
      })),
    ),
    parent: 'provider-offering-details',
    data: {
      skipHero: true,
    },
  },

  {
    name: 'public.marketplace-landing',
    url: '/marketplace/',
    component: lazyComponent(() =>
      import('./landing/LandingPage').then((module) => ({
        default: module.LandingPage,
      })),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      permissions: [canAccessMarketplace],
    },
  },

  {
    name: 'auth-marketplace-orders',
    url: '/marketplace-orders/',
    component: lazyComponent(() =>
      import('./orders/list/MarketplaceOrdersList').then((module) => ({
        default: module.MarketplaceOrdersList,
      })),
    ),
    parent: 'layout',
    data: {
      auth: true,
      breadcrumb: () => translate('Orders'),
      permissions: [
        () => !isFeatureVisible(MarketplaceFeatures.catalogue_only),
        canAccessMarketplace,
      ],
    },
  },

  {
    name: 'public-offering',
    url: '',
    abstract: true,
    parent: 'public',
    component: lazyComponent(() =>
      import('./offerings/OfferingPublicUIView').then((module) => ({
        default: module.OfferingPublicUIView,
      })),
    ),
  },
  {
    name: 'public-offering.marketplace-public-offering',
    url: '/marketplace-public-offering/:uuid/?tab',
    component: lazyComponent(() =>
      import('./offerings/details/PublicOfferingDetailsContainer').then(
        (module) => ({ default: module.PublicOfferingDetailsContainer }),
      ),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      useExtraTabs: true,
      permissions: [canAccessMarketplace],
    },
  },
  {
    name: 'public.marketplace-category',
    url: '/marketplace-category/:category_uuid/',
    component: lazyComponent(() =>
      import('./category/CategoryPage').then((module) => ({
        default: module.CategoryPage,
      })),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      useExtraTabs: true,
      permissions: [canAccessMarketplace],
    },
  },
  {
    name: 'public.offerings',
    url: '/marketplace-public-offerings/?{initialMode}',
    component: lazyComponent(() =>
      import('./category/AllOfferingsList').then((module) => ({
        default: module.AllOfferingsList,
      })),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      useExtraTabs: true,
      permissions: [canAccessMarketplace],
    },
  },
  {
    name: 'public.marketplace-category-group',
    url: '/marketplace-category-group/:group_uuid/',
    component: lazyComponent(() =>
      import('./category/CategoryGroupPage').then((module) => ({
        default: module.CategoryGroupPage,
      })),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      useExtraTabs: true,
      permissions: [canAccessMarketplace],
    },
  },

  {
    name: 'marketplace-provider-details',
    url: 'marketplace-provider-details/:customer_uuid/',
    component: lazyComponent(() =>
      import('./service-providers/ProviderDetails').then((module) => ({
        default: module.ProviderDetails,
      })),
    ),
    parent: 'project',
  },

  {
    name: 'marketplace-provider-details-customer',
    url: 'marketplace-provider-details/:customer_uuid/',
    component: lazyComponent(() =>
      import('./service-providers/ProviderDetails').then((module) => ({
        default: module.ProviderDetails,
      })),
    ),
    parent: 'organization',
  },

  {
    name: 'marketplace-provider',
    abstract: true,
    url: '/providers/:uuid/',
    parent: 'layout',
    component: lazyComponent(() =>
      import('@/organization/OrganizationUIView').then((module) => ({
        default: module.OrganizationUIView,
      })),
    ),
    data: {
      auth: true,
      title: () => translate('Service provider'),
    },
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
      {
        token: 'provider',
        resolveFn: fetchProvider,
        deps: ['$transition$'],
      },
    ],
  },

  {
    name: 'marketplace-providers',
    url: '/marketplace-provider-details/',
    component: UIView,
    abstract: true,
    parent: 'public',
  },

  {
    name: 'marketplace-providers.details',
    url: ':customer_uuid/?tab',
    component: lazyComponent(() =>
      import('./service-providers/details/ProviderDetailsContainer').then(
        (module) => ({ default: module.ProviderDetailsContainer }),
      ),
    ),
  },

  {
    name: 'marketplace-provider-dashboard',
    url: 'dashboard/',
    component: lazyComponent(() =>
      import('@/marketplace/service-providers/dashboard/ProviderDashboard').then(
        (module) => ({ default: module.ProviderDashboard }),
      ),
    ),
    parent: 'marketplace-provider',
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },

  {
    name: 'marketplace-provider-events',
    url: 'events/',
    component: lazyComponent(() =>
      import('./service-providers/dashboard/ProviderEventsTable').then(
        (module) => ({ default: module.ProviderEventsTable }),
      ),
    ),
    parent: 'marketplace-provider',
    data: {
      breadcrumb: () => translate('Audit logs'),
      priority: 160,
    },
  },

  {
    name: 'marketplace-provider-customers',
    parent: 'marketplace-provider',
    abstract: true,
    component: UIView,
    url: '',
    redirectTo: 'marketplace-provider-organizations',
    data: {
      breadcrumb: () => translate('Customers'),
      priority: 110,
    },
  },

  {
    name: 'marketplace-provider-tean',
    parent: 'marketplace-provider',
    component: lazyComponent(() =>
      import('./service-providers/ProviderTeamPage').then((module) => ({
        default: module.ProviderTeamPage,
      })),
    ),
    url: 'team',
    data: {
      breadcrumb: () => translate('Team'),
      priority: 155,
    },
  },

  {
    name: 'marketplace-provider-maintenance',
    parent: 'marketplace-provider',
    url: 'maintenance/',
    component: lazyComponent(() =>
      import('./service-providers/ProviderMaintenanceList').then((module) => ({
        default: module.ProviderMaintenanceList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Maintenance announcements'),
    },
  },

  {
    name: 'marketplace-provider-compliance',
    parent: 'marketplace-provider',
    url: 'compliance/',
    component: lazyComponent(() =>
      import('./service-providers/compliance/ProviderComplianceTable').then(
        (module) => ({
          default: module.ProviderComplianceTable,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Compliance'),
    },
  },

  {
    name: 'provider-marketplace',
    abstract: true,
    parent: 'marketplace-provider',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Marketplace'),
      priority: 120,
    },
  },

  {
    name: 'provider-resources',
    abstract: true,
    parent: 'marketplace-provider',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 130,
    },
  },

  {
    name: 'provider-calls',
    abstract: true,
    parent: 'marketplace-provider',
    component: UIView,
    url: '',
    data: {
      feature: MarketplaceFeatures.show_call_management_functionality,
      breadcrumb: () => translate('Calls for proposals'),
      priority: 140,
    },
  },

  {
    name: 'managed-projects',
    abstract: true,
    parent: 'marketplace-provider',
    component: UIView,
    url: '',
    data: {
      permissions: [() => ENV.plugins.WALDUR_OPENPORTAL?.ENABLED],
      breadcrumb: () => translate('Managed projects'),
      priority: 150,
    },
  },

  {
    name: 'marketplace-vendor-offerings',
    url: 'offerings/?{state}',
    component: lazyComponent(() =>
      import('./service-providers/ProviderOfferingsList').then((module) => ({
        default: module.ProviderOfferingsList,
      })),
    ),
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offerings'),
      priority: 10,
    },
  },

  {
    name: 'marketplace-vendor-offering-users',
    url: 'offering-users/',
    component: lazyComponent(() =>
      import('./service-providers/offering-users/ProviderOfferingUsersWithTabs').then(
        (module) => ({
          default: module.ProviderOfferingUsersWithTabs,
        }),
      ),
    ),
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offering users'),
      priority: 30,
    },
  },

  {
    name: 'marketplace-provider-organizations',
    parent: 'marketplace-provider-customers',
    url: 'organizations/',
    component: lazyComponent(() =>
      import('./service-providers/ProviderOrganizationsList').then(
        (module) => ({
          default: module.ProviderOrganizationsList,
        }),
      ),
    ),
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'marketplace-provider-users',
    parent: 'marketplace-provider-customers',
    url: 'users/',
    component: lazyComponent(() =>
      import('./service-providers/ProviderUsersList').then((module) => ({
        default: module.ProviderUsersList,
      })),
    ),
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'marketplace-provider-projects',
    parent: 'marketplace-provider-customers',
    url: 'projects/',
    component: lazyComponent(() =>
      import('./service-providers/ProviderProjectsList').then((module) => ({
        default: module.ProviderProjectsList,
      })),
    ),
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'marketplace-provider-user-manage-container',
    url: '',
    parent: 'marketplace-provider-customers',
    component: lazyComponent(() =>
      import('@/user/UserManageContainer').then((module) => ({
        default: module.UserManageContainer,
      })),
    ),
    abstract: true,
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'marketplace-provider-user-manage',
    parent: 'marketplace-provider-user-manage-container',
    url: 'users/:user_uuid/?tab',
    component: lazyComponent(() =>
      import('@/user/UserManage').then((module) => ({
        default: module.UserManage,
      })),
    ),
  },

  {
    name: 'organization-offering-permissions',
    url: 'offering-permissions/',
    component: lazyComponent(() =>
      import('./service-providers/OfferingPermissionsList').then((module) => ({
        default: module.OfferingPermissionsList,
      })),
    ),
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offering managers'),
      priority: 40,
    },
  },

  {
    name: 'marketplace-my-offerings',
    url: 'marketplace-my-offerings/',
    component: lazyComponent(() =>
      import('./offerings/list/MyOfferingsList').then((module) => ({
        default: module.MyOfferingsList,
      })),
    ),
    parent: 'organization',
    data: {
      breadcrumb: () => translate('My offerings'),
      permissions: [
        isOwnerOrStaff,
        (state) => Boolean(state.workspace.customer?.has_my_offerings),
      ],
      priority: 130,
    },
  },

  {
    name: 'marketplace-projects',
    url: 'marketplace-projects/',
    component: lazyComponent(() =>
      import('@/project/ProjectsListWithTabs').then((module) => ({
        default: module.ProjectsListWithTabs,
      })),
    ),
    parent: 'organization',
    data: {
      breadcrumb: () => translate('Projects'),
      priority: 105,
      permissions: [userHasCustomerPermission(PermissionEnum.LIST_PROJECTS)],
    },
  },

  {
    name: 'provider-offering-update',
    url: '',
    abstract: true,
    parent: 'provider-offering',
    component: lazyComponent(() =>
      import('./offerings/OfferingEditUIView').then((module) => ({
        default: module.OfferingEditUIView,
      })),
    ),
  },
  {
    name: 'marketplace-offering-update',
    url: 'offering-update/:offering_uuid/?tab&section',
    params: {
      tab: { dynamic: true },
      section: { dynamic: true },
    },
    component: lazyComponent(() =>
      import('./offerings/update/OfferingUpdateContainer').then((module) => ({
        default: module.OfferingUpdateContainer,
      })),
    ),
    parent: 'provider-offering-update',
    data: {
      skipHero: true,
    },
  },

  {
    name: 'marketplace-orders',
    url: '/marketplace-order-details/',
    abstract: true,
    component: UIView,
    parent: 'public',
  },

  {
    name: 'marketplace-orders.details',
    url: ':order_uuid/?tab',
    component: lazyComponent(() =>
      import('./orders/OrderDetailsContainer').then((module) => ({
        default: module.OrderDetailsContainer,
      })),
    ),
    data: {
      permissions: [canAccessMarketplace],
    },
    params: {
      tab: {
        dynamic: true,
      },
    },
  },

  {
    name: 'marketplace-public-resources',
    url: 'resources-list/?{state}',
    component: lazyComponent(() =>
      import('./resources/list/ProviderResourcesList').then((module) => ({
        default: module.ProviderResourcesList,
      })),
    ),
    parent: 'provider-resources',
    data: {
      breadcrumb: () => translate('Resources'),
    },
  },

  {
    name: 'marketplace-provider-robots',
    url: 'robots/',
    component: lazyComponent(() =>
      import('@/marketplace/robot-accounts/ProviderRobotAccountList').then(
        (module) => ({ default: module.ProviderRobotAccountList }),
      ),
    ),
    parent: 'provider-resources',
    data: {
      breadcrumb: () => translate('Robot accounts'),
    },
  },

  {
    name: 'marketplace-provider-orders',
    url: 'orders/',
    component: lazyComponent(() =>
      import('@/marketplace/service-providers/ProviderOrdersList').then(
        (module) => ({ default: module.ProviderOrdersList }),
      ),
    ),
    parent: 'provider-resources',
    data: {
      breadcrumb: () => translate('Orders'),
      permissions: [
        () => !isFeatureVisible(MarketplaceFeatures.catalogue_only),
      ],
    },
  },

  {
    name: 'marketplace-provider-offering-requests',
    url: 'offering-requests/',
    component: lazyComponent(() =>
      import('@/proposals/offering-requests/OfferingRequestsList').then(
        (module) => ({ default: module.OfferingRequestsList }),
      ),
    ),
    parent: 'provider-calls',
    data: {
      feature: MarketplaceFeatures.show_call_management_functionality,
      breadcrumb: () => translate('Requests for offerings'),
    },
  },

  {
    name: 'marketplace-provider-managed-projects',
    url: 'managed-projects/',
    component: lazyComponent(() =>
      import('@/openportal/managed-projects/ManagedProjectsList').then(
        (module) => ({ default: module.ManagedProjectsList }),
      ),
    ),
    parent: 'managed-projects',
    data: {
      permissions: [() => ENV.plugins.WALDUR_OPENPORTAL?.ENABLED],
      breadcrumb: () => translate('Externally managed projects'),
    },
  },

  {
    name: 'marketplace-provider-project-templates',
    url: 'project-templates/',
    component: lazyComponent(() =>
      import('@/openportal/project-templates/ProjectTemplateList').then(
        (module) => ({ default: module.ProjectTemplateList }),
      ),
    ),
    parent: 'managed-projects',
    data: {
      permissions: [() => ENV.plugins.WALDUR_OPENPORTAL?.ENABLED],
      breadcrumb: () => translate('Available managed project templates'),
    },
  },

  {
    name: 'marketplace-resource-container',
    url: '',
    abstract: true,
    parent: 'layout',
    component: lazyComponent(() =>
      import('./resources/details/ResourceDetailsContainer').then((module) => ({
        default: module.ResourceDetailsContainer,
      })),
    ),
  },
  {
    name: 'marketplace-resource-details',
    url: '/resource-details/:resource_uuid?tab&team_tab&object',
    parent: 'marketplace-resource-container',
    params: {
      tab: { dynamic: true },
      team_tab: { dynamic: true },
      object: { dynamic: true },
    },
    component: lazyComponent(() =>
      import('@/marketplace/resources/details/ResourceDetailsPage').then(
        (module) => ({ default: module.ResourceDetailsPage }),
      ),
    ),
    data: {
      useExtraTabs: true,
      skipBreadcrumb: true,
      skipHero: true,
    },
  },
  {
    name: 'admin-marketplace-offerings',
    parent: 'admin-marketplace',
    url: 'offerings/',
    component: lazyComponent(() =>
      import('@/marketplace/offerings/admin/AdminOfferingsList').then(
        (module) => ({ default: module.AdminOfferingsList }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Available offerings'),
      priority: 10,
    },
  },
  {
    name: 'admin-marketplace-duplicate-offerings',
    parent: 'admin-marketplace',
    url: 'openstack-duplicate-offerings/',
    component: lazyComponent(() =>
      import('@/marketplace/offerings/admin/DuplicateOfferingsList').then(
        (module) => ({ default: module.DuplicateOfferingsList }),
      ),
    ),
    data: {
      breadcrumb: () => translate('OpenStack duplicate offerings'),
      feature: MarketplaceFeatures.show_openstack_duplicate_offerings,
      priority: 15,
    },
  },

  {
    name: 'admin-offering',
    url: '',
    abstract: true,
    parent: 'admin',
    component: lazyComponent(() =>
      import('./offerings/OfferingUIView').then((module) => ({
        default: module.OfferingUIView,
      })),
    ),
  },
  {
    name: 'admin-offering-details',
    url: '',
    abstract: true,
    parent: 'admin-offering',
    component: lazyComponent(() =>
      import('./offerings/OfferingDetailsUIView').then((module) => ({
        default: module.OfferingDetailsUIView,
      })),
    ),
  },
  {
    name: 'admin-marketplace-offering-details',
    url: 'offerings/:offering_uuid/?tab&customerTab',
    params: {
      tab: { dynamic: true },
      customerTab: { dynamic: true },
    },
    component: lazyComponent(() =>
      import('./offerings/details/OfferingContainer').then((module) => ({
        default: module.OfferingContainer,
      })),
    ),
    parent: 'admin-offering-details',
  },

  {
    name: 'admin-offering-update',
    url: '',
    abstract: true,
    parent: 'admin-offering',
    component: lazyComponent(() =>
      import('./offerings/OfferingEditUIView').then((module) => ({
        default: module.OfferingEditUIView,
      })),
    ),
  },
  {
    name: 'admin-marketplace-offering-update',
    url: 'offerings/:offering_uuid/update/?tab&section',
    params: {
      tab: { dynamic: true },
      section: { dynamic: true },
    },
    component: lazyComponent(() =>
      import('./offerings/update/OfferingUpdateContainer').then((module) => ({
        default: module.OfferingUpdateContainer,
      })),
    ),
    parent: 'admin-offering-update',
  },

  {
    name: 'marketplace-provider-campaigns',
    parent: 'provider-marketplace',
    url: 'marketplace-provider-campaigns/',
    component: lazyComponent(() =>
      import('./service-providers/ProviderCampaignsList').then((module) => ({
        default: module.ProviderCampaignsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Campaigns'),
      priority: 50,
    },
  },

  {
    name: 'marketplace-provider-offering-groups',
    parent: 'provider-marketplace',
    url: 'offering-groups/',
    component: lazyComponent(() =>
      import('./service-providers/offering-groups/ProviderOfferingGroupsList').then(
        (module) => ({
          default: module.ProviderOfferingGroupsList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Offering groups'),
      priority: 20,
    },
  },

  {
    name: 'marketplace-provider-posix-id-pools',
    parent: 'provider-marketplace',
    url: 'posix-id-pools/',
    component: lazyComponent(() =>
      import('./service-providers/posix-id-pools/ProviderPosixIdPoolsList').then(
        (module) => ({
          default: module.ProviderPosixIdPoolsList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('POSIX ID pools'),
      priority: 21,
      permissions: [
        () => isFeatureVisible(MarketplaceFeatures.show_posix_id_pools),
      ],
    },
  },

  {
    name: 'public.marketplace-providers',
    url: '/marketplace-providers/',
    component: lazyComponent(() =>
      import('./service-providers/ServiceProvidersList').then((module) => ({
        default: module.ServiceProvidersList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Service providers'),
      permissions: [canAccessMarketplace],
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
];
