import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { fetchCustomer } from '@waldur/customer/workspace/CustomerWorkspace';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';
import { OrganizationUIView } from '@waldur/organization/OrganizationUIView';
import { WorkspaceType } from '@waldur/workspace/types';

import { fetchProvider, loadContext } from './resolve';

const AdminOfferingsList = lazyComponent(
  () => import('@waldur/marketplace/offerings/admin/AdminOfferingsList'),
  'AdminOfferingsList',
);
const ResourceDetailsPage = lazyComponent(
  () => import('@waldur/marketplace/resources/details/ResourceDetailsPage'),
  'ResourceDetailsPage',
);
const ProviderDashboard = lazyComponent(
  () =>
    import('@waldur/marketplace/service-providers/dashboard/ProviderDashboard'),
  'ProviderDashboard',
);
const Layout = lazyComponent(
  () => import('@waldur/navigation/Layout'),
  'Layout',
);
const CategoryPage = lazyComponent(
  () => import('./category/CategoryPage'),
  'CategoryPage',
);
const CategoryGroupPage = lazyComponent(
  () => import('./category/CategoryGroupPage'),
  'CategoryGroupPage',
);
const AllOfferingsList = lazyComponent(
  () => import('./category/AllOfferingsList'),
  'AllOfferingsList',
);
const OfferingDetailsPage = lazyComponent(
  () => import('./details/DetailsPage'),
  'OfferingDetailsPage',
);
const LandingPage = lazyComponent(
  () => import('./landing/LandingPage'),
  'LandingPage',
);
const OfferingContainer = lazyComponent(
  () => import('./offerings/details/OfferingContainer'),
  'OfferingContainer',
);
const PublicOfferingDetailsContainer = lazyComponent(
  () => import('./offerings/details/PublicOfferingDetailsContainer'),
  'PublicOfferingDetailsContainer',
);
const MyOfferingsList = lazyComponent(
  () => import('./offerings/list/MyOfferingsList'),
  'MyOfferingsList',
);
const ProviderOfferingsList = lazyComponent(
  () => import('./service-providers/ProviderOfferingsList'),
  'ProviderOfferingsList',
);
const OfferingUpdateContainer = lazyComponent(
  () => import('./offerings/update/OfferingUpdateContainer'),
  'OfferingUpdateContainer',
);
const OrdersList = lazyComponent(
  () => import('./orders/list/OrdersList'),
  'OrdersList',
);
const SupportOrdersList = lazyComponent(
  () => import('./orders/list/SupportOrdersList'),
  'SupportOrdersList',
);
const OrderDetails = lazyComponent(
  () => import('./orders/details/OrderDetails'),
  'OrderDetails',
);
const CustomerOrdersList = lazyComponent(
  () => import('./orders/list/CustomerOrdersList'),
  'CustomerOrdersList',
);
const ProjectResourcesContainer = lazyComponent(
  () => import('./resources/list/ProjectResourcesContainer'),
  'ProjectResourcesContainer',
);
const ProjectResourcesAllList = lazyComponent(
  () => import('./resources/list/ProjectResourcesAllList'),
  'ProjectResourcesAllList',
);
const OrganizationResourcesAllList = lazyComponent(
  () => import('./resources/list/OrganizationResourcesAllList'),
  'OrganizationResourcesAllList',
);
const PublicResourcesList = lazyComponent(
  () => import('./resources/list/PublicResourcesList'),
  'PublicResourcesList',
);
const SupportResourcesList = lazyComponent(
  () => import('./resources/list/SupportResourcesList'),
  'SupportResourcesList',
);
const ProviderDetails = lazyComponent(
  () => import('./service-providers/ProviderDetails'),
  'ProviderDetails',
);
const ProviderOrganizationsList = lazyComponent(
  () => import('./service-providers/ProviderOrganizationsList'),
  'ProviderOrganizationsList',
);
const ProviderUsersList = lazyComponent(
  () => import('./service-providers/ProviderUsersList'),
  'ProviderUsersList',
);
const ProviderCampaignsList = lazyComponent(
  () => import('./service-providers/ProviderCampaignsList'),
  'ProviderCampaignsList',
);
const OfferingPermissionsList = lazyComponent(
  () => import('./service-providers/OfferingPermissionsList'),
  'OfferingPermissionsList',
);
const ProviderOfferingUsersList = lazyComponent(
  () => import('./service-providers/ProviderOfferingUsersList'),
  'ProviderOfferingUsersList',
);
const ProviderRobotAccountList = lazyComponent(
  () => import('@waldur/marketplace/robot-accounts/ProviderRobotAccountList'),
  'ProviderRobotAccountList',
);
const OfferingRequestsList = lazyComponent(
  () => import('@waldur/proposals/offering-requests/OfferingRequestsList'),
  'OfferingRequestsList',
);
const ProjectsListContainer = lazyComponent(
  () => import('@waldur/project/ProjectsListContainer'),
  'ProjectsListContainer',
);
const BasicLexisLinkList = lazyComponent(
  () => import('./resources/lexis/BasicLexisLinkList'),
  'BasicLexisLinkList',
);
const OfferingPublicUIView = lazyComponent(
  () => import('./offerings/OfferingPublicUIView'),
  'OfferingPublicUIView',
);
const OfferingDetailsUIView = lazyComponent(
  () => import('./offerings/OfferingDetailsUIView'),
  'OfferingDetailsUIView',
);
const OfferingEditUIView = lazyComponent(
  () => import('./offerings/OfferingEditUIView'),
  'OfferingEditUIView',
);
const ServiceProvidersList = lazyComponent(
  () => import('./service-providers/ServiceProvidersList'),
  'ServiceProvidersList',
);

const getPublicRoutesParams = () => ({
  resolve: [
    {
      token: 'public-context',
      resolveFn: loadContext,
      deps: ['$transition$'],
    },
  ],
});

const getResourceDetailsParams = {
  component: ResourceDetailsPage,
  data: {
    useExtraTabs: true,
    skipBreadcrumb: true,
    skipHero: true,
  },
};

export const states: StateDeclaration[] = [
  {
    name: 'public',
    url: '',
    abstract: true,
    component: Layout,
    ...getPublicRoutesParams(),
  },

  {
    name: 'marketplace-offering-public',
    url: '/marketplace-provider-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'public',
    data: {
      hideProjectSelector: true,
    },
  },

  {
    name: 'provider-offering-details',
    url: '',
    abstract: true,
    parent: 'marketplace-provider',
    component: OfferingDetailsUIView,
  },
  {
    name: 'marketplace-offering-details',
    url: 'marketplace-provider-offering-details/:offering_uuid/?tab',
    component: OfferingContainer,
    parent: 'provider-offering-details',
    data: {
      skipHero: true,
    },
  },

  {
    name: 'public.marketplace-landing',
    url: '/marketplace/',
    component: LandingPage,
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      hideProjectSelector: true,
    },
  },

  {
    name: 'public.marketplace-providers',
    url: '/marketplace-providers/',
    component: ServiceProvidersList,
    data: {
      breadcrumb: () => translate('Service providers'),
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      hideProjectSelector: true,
    },
  },

  {
    name: 'public-offering',
    url: '',
    abstract: true,
    parent: 'public',
    component: OfferingPublicUIView,
  },
  {
    name: 'public-offering.marketplace-public-offering',
    url: '/marketplace-public-offering/:uuid/?tab',
    component: PublicOfferingDetailsContainer,
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      useExtraTabs: true,
      hideProjectSelector: true,
    },
  },
  {
    name: 'public.marketplace-category',
    url: '/marketplace-category/:category_uuid/',
    component: CategoryPage,
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      useExtraTabs: true,
      hideProjectSelector: true,
    },
  },
  {
    name: 'public.offerings',
    url: '/marketplace-public-offerings/',
    component: AllOfferingsList,
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      useExtraTabs: true,
      hideProjectSelector: true,
    },
  },
  {
    name: 'public.marketplace-category-group',
    url: '/marketplace-category-group/:group_uuid/',
    component: CategoryGroupPage,
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
      useExtraTabs: true,
      hideProjectSelector: true,
    },
  },

  {
    name: 'marketplace-project-order-list',
    url: 'marketplace-project-order-list/',
    component: CustomerOrdersList,
    parent: 'project',
    data: {
      breadcrumb: () => translate('My orders'),
    },
  },

  {
    name: 'marketplace-provider-details',
    url: 'marketplace-provider-details/:customer_uuid/',
    component: ProviderDetails,
    parent: 'project',
  },

  {
    name: 'marketplace-provider-details-customer',
    url: 'marketplace-provider-details/:customer_uuid/',
    component: ProviderDetails,
    parent: 'organization',
  },

  {
    name: 'marketplace-organization-order-list',
    url: 'marketplace-organization-order-list/',
    component: CustomerOrdersList,
    parent: 'organization-resources',
    data: {
      breadcrumb: () => translate('Orders'),
      priority: 110,
    },
  },

  {
    name: 'marketplace-provider',
    abstract: true,
    url: '/providers/:uuid/',
    parent: 'layout',
    component: OrganizationUIView,
    data: {
      auth: true,
      workspace: WorkspaceType.ORGANIZATION,
      title: () => translate('Service provider'),
      hideProjectSelector: true,
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
    name: 'marketplace-provider-dashboard',
    url: 'dashboard/',
    component: ProviderDashboard,
    parent: 'marketplace-provider',
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },

  {
    name: 'marketplace-provider-customers',
    parent: 'marketplace-provider',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Customers'),
      priority: 110,
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
    component: ProviderOfferingsList,
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offerings'),
    },
  },

  {
    name: 'marketplace-vendor-offering-users',
    url: 'offering-users/',
    component: ProviderOfferingUsersList,
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offering users'),
    },
  },

  {
    name: 'marketplace-provider-organizations',
    parent: 'marketplace-provider-customers',
    url: 'organizations/',
    component: ProviderOrganizationsList,
    data: {
      breadcrumb: () => translate('Organizations'),
    },
  },

  {
    name: 'marketplace-provider-users',
    parent: 'marketplace-provider-customers',
    url: 'users/',
    component: ProviderUsersList,
    data: {
      breadcrumb: () => translate('Users'),
    },
  },

  {
    name: 'organization-offering-permissions',
    url: 'offering-permissions/',
    component: OfferingPermissionsList,
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offering managers'),
    },
  },

  {
    name: 'marketplace-my-offerings',
    url: 'marketplace-my-offerings/',
    component: MyOfferingsList,
    parent: 'organization',
    data: {
      breadcrumb: () => translate('My offerings'),
    },
  },

  {
    name: 'marketplace-projects',
    url: 'marketplace-projects/',
    component: ProjectsListContainer,
    parent: 'organization',
    data: {
      breadcrumb: () => translate('Projects'),
    },
  },

  {
    name: 'provider-offering-update',
    url: '',
    abstract: true,
    parent: 'marketplace-provider',
    component: OfferingEditUIView,
  },
  {
    name: 'marketplace-offering-update',
    url: 'offering-update/:offering_uuid/?tab',
    component: OfferingUpdateContainer,
    parent: 'provider-offering-update',
    data: {
      skipHero: true,
    },
  },

  {
    name: 'marketplace-order-details-project',
    url: 'marketplace-order-details/:order_uuid/',
    component: OrderDetails,
    parent: 'project',
  },

  {
    name: 'marketplace-order-details-customer',
    url: 'marketplace-order-details/:order_uuid/',
    component: OrderDetails,
    parent: 'organization',
  },

  {
    name: 'marketplace-orders',
    url: 'marketplace-orders/?{state}',
    component: OrdersList,
    parent: 'provider-resources',
    data: {
      breadcrumb: () => translate('Orders'),
    },
  },

  {
    name: 'marketplace-public-resources',
    url: 'resources-list/?{state}',
    component: PublicResourcesList,
    parent: 'provider-resources',
    data: {
      breadcrumb: () => translate('Resources'),
    },
  },

  {
    name: 'marketplace-provider-robots',
    url: 'robots/',
    component: ProviderRobotAccountList,
    parent: 'provider-resources',
    data: {
      breadcrumb: () => translate('Robot accounts'),
    },
  },

  {
    name: 'marketplace-provider-offering-requests',
    url: 'offering-requests/',
    component: OfferingRequestsList,
    parent: 'provider-calls',
    data: {
      feature: MarketplaceFeatures.show_call_management_functionality,
      breadcrumb: () => translate('Requests for offerings'),
    },
  },

  {
    name: 'marketplace-public-resource-details',
    url: 'resource-details/:resource_uuid?tab',
    parent: 'organization',
    ...getResourceDetailsParams,
  },

  {
    name: 'marketplace-admin-resource-details',
    url: 'resource-details/:resource_uuid?tab',
    parent: 'admin',
    ...getResourceDetailsParams,
  },

  {
    name: 'marketplace-profile-resource-details',
    url: 'resource-details/:resource_uuid?tab',
    parent: 'profile',
    ...getResourceDetailsParams,
  },

  {
    name: 'marketplace-provider-resource-details',
    url: 'resources/:resource_uuid?tab',
    parent: 'provider-resources',
    ...getResourceDetailsParams,
  },

  {
    name: 'marketplace-project-resource-details',
    url: 'resource-details/:resource_uuid?tab',
    parent: 'project',
    ...getResourceDetailsParams,
  },

  {
    name: 'marketplace-admin-resources',
    url: '',
    component: UIView,
    abstract: true,
    parent: 'admin',
    data: {
      breadcrumb: () => translate('Resources'),
    },
  },
  {
    name: 'marketplace-admin-resources-list',
    url: 'resources/',
    component: SupportResourcesList,
    parent: 'marketplace-admin-resources',
    data: {
      breadcrumb: () => translate('Resources'),
    },
  },
  {
    name: 'marketplace-admin-lexis-links-list',
    url: 'lexis-links/',
    component: BasicLexisLinkList,
    parent: 'marketplace-admin-resources',
    data: {
      breadcrumb: () => translate('LEXIS links'),
      permissions: [
        () => {
          if (isFeatureVisible(MarketplaceFeatures.lexis_links)) {
            return true;
          }
        },
      ],
    },
  },
  {
    name: 'marketplace-admin-robot-accounts',
    url: 'robot-accounts/',
    component: ProviderRobotAccountList,
    parent: 'marketplace-admin-resources',
    data: {
      breadcrumb: () => translate('Robot accounts'),
    },
  },

  {
    name: 'admin-marketplace-offerings',
    parent: 'admin-marketplace',
    url: 'offerings/',
    component: AdminOfferingsList,
    data: {
      breadcrumb: () => translate('Available offerings'),
    },
  },

  {
    name: 'admin-offering-details',
    url: '',
    abstract: true,
    parent: 'admin',
    component: OfferingDetailsUIView,
  },
  {
    name: 'admin-marketplace-offering-details',
    url: 'offerings/:offering_uuid/?tab',
    component: OfferingContainer,
    parent: 'admin-offering-details',
  },

  {
    name: 'admin-offering-update',
    url: '',
    abstract: true,
    parent: 'admin',
    component: OfferingEditUIView,
  },
  {
    name: 'admin-marketplace-offering-update',
    url: 'offerings/:offering_uuid/update/?tab',
    component: OfferingUpdateContainer,
    parent: 'admin-offering-update',
  },

  {
    name: 'marketplace-provider-campaigns',
    parent: 'provider-marketplace',
    url: 'marketplace-provider-campaigns/',
    component: ProviderCampaignsList,
    data: {
      breadcrumb: () => translate('Campaigns'),
    },
  },

  {
    name: 'marketplace-support-orders',
    url: 'orders/',
    parent: 'marketplace-admin-resources',
    component: SupportOrdersList,
    data: {
      breadcrumb: () => translate('Orders'),
    },
  },

  {
    name: 'marketplace-project-resources',
    url: 'marketplace-resources/:category_uuid/',
    component: ProjectResourcesContainer,
    parent: 'project',
    data: {
      hideHeaderMenu: true,
    },
  },

  {
    name: 'marketplace-project-resources-all',
    url: 'marketplace-resources/',
    component: ProjectResourcesAllList,
    parent: 'project',
    data: {
      breadcrumb: () => translate('All resources'),
      hideHeaderMenu: true,
    },
  },

  {
    name: 'marketplace-organization-resources-all',
    url: 'marketplace-resources/',
    component: OrganizationResourcesAllList,
    parent: 'organization-resources',
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 100,
    },
  },
];
