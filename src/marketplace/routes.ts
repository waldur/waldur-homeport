import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { userHasCustomerPermission } from '@waldur/customer/utils';
import { fetchCustomer } from '@waldur/customer/workspace/fetchCustomer';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';
import { PermissionEnum } from '@waldur/permissions/enums';
import { getUser, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { fetchProvider } from './resolve';

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
  },

  {
    name: 'provider-offering-details',
    url: '',
    abstract: true,
    parent: 'marketplace-provider',
    component: lazyComponent(() =>
      import('./offerings/OfferingDetailsUIView').then((module) => ({
        default: module.OfferingDetailsUIView,
      })),
    ),
  },
  {
    name: 'marketplace-offering-details',
    url: 'marketplace-provider-offering-details/:offering_uuid/?tab',
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
    },
  },

  {
    name: 'public.marketplace-orders',
    url: '/marketplace-orders/',
    component: lazyComponent(() =>
      import('./orders/list/MarketplaceOrdersList').then((module) => ({
        default: module.MarketplaceOrdersList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Orders'),
      permissions: [
        () => !isFeatureVisible(MarketplaceFeatures.catalogue_only),
        (state) => Boolean(getUser(state)),
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
      import('@waldur/organization/OrganizationUIView').then((module) => ({
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
      import(
        '@waldur/marketplace/service-providers/dashboard/ProviderDashboard'
      ).then((module) => ({ default: module.ProviderDashboard })),
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
    },
  },

  {
    name: 'marketplace-vendor-offering-users',
    url: 'offering-users/',
    component: lazyComponent(() =>
      import('./service-providers/ProviderOfferingUsersList').then(
        (module) => ({
          default: module.ProviderOfferingUsersList,
        }),
      ),
    ),
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offering users'),
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
    name: 'marketplace-provider-user-manage',
    parent: 'marketplace-provider-user-manage-container',
    url: 'users/:user_uuid/?tab',
    component: lazyComponent(() =>
      import('@waldur/user/UserManage').then((module) => ({
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
      permissions: [isOwnerOrStaff],
      priority: 130,
    },
  },

  {
    name: 'marketplace-projects',
    url: 'marketplace-projects/',
    component: lazyComponent(() =>
      import('@waldur/project/ProjectsList').then((module) => ({
        default: module.ProjectsList,
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
    parent: 'marketplace-provider',
    component: lazyComponent(() =>
      import('./offerings/OfferingEditUIView').then((module) => ({
        default: module.OfferingEditUIView,
      })),
    ),
  },
  {
    name: 'marketplace-offering-update',
    url: 'offering-update/:offering_uuid/?tab',
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
      import(
        '@waldur/marketplace/robot-accounts/ProviderRobotAccountList'
      ).then((module) => ({ default: module.ProviderRobotAccountList })),
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
      import('@waldur/marketplace/service-providers/ProviderOrdersList').then(
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
      import('@waldur/proposals/offering-requests/OfferingRequestsList').then(
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
    url: '/resource-details/:resource_uuid?tab',
    parent: 'marketplace-resource-container',
    component: lazyComponent(() =>
      import('@waldur/marketplace/resources/details/ResourceDetailsPage').then(
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
      import('@waldur/marketplace/offerings/admin/AdminOfferingsList').then(
        (module) => ({ default: module.AdminOfferingsList }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Available offerings'),
    },
  },

  {
    name: 'admin-offering-details',
    url: '',
    abstract: true,
    parent: 'admin',
    component: lazyComponent(() =>
      import('./offerings/OfferingDetailsUIView').then((module) => ({
        default: module.OfferingDetailsUIView,
      })),
    ),
  },
  {
    name: 'admin-marketplace-offering-details',
    url: 'offerings/:offering_uuid/?tab',
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
    parent: 'admin',
    component: lazyComponent(() =>
      import('./offerings/OfferingEditUIView').then((module) => ({
        default: module.OfferingEditUIView,
      })),
    ),
  },
  {
    name: 'admin-marketplace-offering-update',
    url: 'offerings/:offering_uuid/update/?tab',
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
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
];
