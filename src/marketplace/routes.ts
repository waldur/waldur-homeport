import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { fetchCustomer } from '@waldur/customer/workspace/CustomerWorkspace';
import { translate } from '@waldur/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { loadContext, fetchProvider } from './resolve';

const AdminOfferingsListContainer = lazyComponent(
  () =>
    import('@waldur/marketplace/offerings/admin/AdminOfferingsListContainer'),
  'AdminOfferingsListContainer',
);
const ResourceDetailsPage = lazyComponent(
  () => import('@waldur/marketplace/resources/details/ResourceDetailsPage'),
  'ResourceDetailsPage',
);
const ProviderDashboard = lazyComponent(
  () => import('@waldur/providers/dashboard/ProviderDashboard'),
  'ProviderDashboard',
);
const Layout = lazyComponent(
  () => import('@waldur/navigation/Layout'),
  'Layout',
);
const CheckoutPage = lazyComponent(
  () => import('./cart/CheckoutPage'),
  'CheckoutPage',
);
const ShoppingCartItemUpdate = lazyComponent(
  () => import('./cart/ShoppingCartItemUpdate'),
  'ShoppingCartItemUpdate',
);
const AllCategoriesPage = lazyComponent(
  () => import('./category/list/AllCategoriesPage'),
  'AllCategoriesPage',
);
const CategoryPage = lazyComponent(
  () => import('./category/CategoryPage'),
  'CategoryPage',
);
const ComparisonTable = lazyComponent(
  () => import('./compare/ComparisonTable'),
  'ComparisonTable',
);
const OfferingDetailsPage = lazyComponent(
  () => import('./details/DetailsPage'),
  'OfferingDetailsPage',
);
const MarketplaceLanding = lazyComponent(
  () => import('./landing/LandingPageContainer'),
  'MarketplaceLanding',
);
const OfferingCreateContainer = lazyComponent(
  () => import('./offerings/create/OfferingCreateContainer'),
  'OfferingCreateContainer',
);
const OfferingContainer = lazyComponent(
  () => import('./offerings/details/OfferingContainer'),
  'OfferingContainer',
);
const PublicOfferingDetailsContainer = lazyComponent(
  () => import('./offerings/details/PublicOfferingDetailsContainer'),
  'PublicOfferingDetailsContainer',
);
const MyOfferingsListContainer = lazyComponent(
  () => import('./offerings/MyOfferingsListContainer'),
  'MyOfferingsListContainer',
);
const ProviderOfferingsList = lazyComponent(
  () => import('./service-providers/ProviderOfferingsList'),
  'ProviderOfferingsList',
);
const PublicServiceProviderDetails = lazyComponent(
  () => import('./offerings/service-providers/PublicServiceProviderDetails'),
  'PublicServiceProviderDetails',
);
const ServiceProvidersContainer = lazyComponent(
  () => import('./offerings/service-providers/ServiceProvidersContainer'),
  'ServiceProvidersContainer',
);
const ImagesContainer = lazyComponent(
  () => import('./offerings/images/ImagesContainer'),
  'ImagesContainer',
);
const OfferingUpdateContainer = lazyComponent(
  () => import('./offerings/update/OfferingUpdateContainer'),
  'OfferingUpdateContainer',
);
const OrderItemDetailsContainer = lazyComponent(
  () => import('./orders/item/details/OrderItemDetailsContainer'),
  'OrderItemDetailsContainer',
);
const MyOrderItemsContainer = lazyComponent(
  () => import('./orders/item/list/MyOrderItemsContainer'),
  'MyOrderItemsContainer',
);
const OrderItemsContainer = lazyComponent(
  () => import('./orders/item/list/OrderItemsContainer'),
  'OrderItemsContainer',
);
const SupportOrdersContainer = lazyComponent(
  () => import('./orders/SupportOrdersContainer'),
  'SupportOrdersContainer',
);
const OrderDetailsContainer = lazyComponent(
  () => import('./orders/OrderDetailsContainer'),
  'OrderDetailsContainer',
);
const OrdersList = lazyComponent(
  () => import('./orders/OrdersList'),
  'OrdersList',
);
const CustomerResourcesContainer = lazyComponent(
  () => import('./resources/list/CustomerResourcesContainer'),
  'CustomerResourcesContainer',
);
const ProjectResourcesContainer = lazyComponent(
  () => import('./resources/list/ProjectResourcesContainer'),
  'ProjectResourcesContainer',
);
const ProjectResourcesAllList = lazyComponent(
  () => import('./resources/list/ProjectResourcesAllList'),
  'ProjectResourcesAllList',
);
const PublicResourcesContainer = lazyComponent(
  () => import('./resources/list/PublicResourcesContainer'),
  'PublicResourcesContainer',
);
const SupportResourcesContainer = lazyComponent(
  () => import('./resources/list/SupportResourcesContainer'),
  'SupportResourcesContainer',
);
const PlanUsageContainer = lazyComponent(
  () => import('./resources/plan-usage/PlanUsageContainer'),
  'PlanUsageContainer',
);
const SupportUsageContainer = lazyComponent(
  () => import('./resources/usage/SupportUsageContainer'),
  'SupportUsageContainer',
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
    name: 'marketplace-landing-project',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'project',
    data: {
      useExtraTabs: true,
    },
  },

  {
    name: 'marketplace-landing-customer',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'organization',
    data: {
      useExtraTabs: true,
    },
  },

  {
    name: 'marketplace-landing-user',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'profile',
    data: {
      useExtraTabs: true,
    },
  },

  {
    name: 'marketplace-compare',
    url: 'marketplace-compare/',
    component: ComparisonTable,
    parent: 'project',
  },

  {
    name: 'marketplace-compare-customer',
    url: 'marketplace-compare/',
    component: ComparisonTable,
    parent: 'organization',
  },

  {
    name: 'marketplace-checkout',
    url: 'marketplace-checkout/',
    component: CheckoutPage,
    parent: 'project',
  },

  {
    name: 'marketplace-offering-project',
    url: 'marketplace-provider-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'project',
  },

  {
    name: 'marketplace-offering-customer',
    url: 'marketplace-provider-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'organization',
  },

  {
    name: 'marketplace-offering-user',
    url: 'marketplace-provider-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'profile',
  },

  {
    name: 'marketplace-offering-details',
    url: 'marketplace-provider-offering-details/:offering_uuid/',
    component: OfferingContainer,
    parent: 'organization',
  },

  {
    name: 'public.marketplace-landing',
    url: '/marketplace/',
    component: MarketplaceLanding,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
  },

  {
    name: 'public.marketplace-public-offering',
    url: '/marketplace-public-offering/:uuid/',
    component: PublicOfferingDetailsContainer,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
  },

  {
    name: 'marketplace-categories-project',
    url: 'marketplace/all/',
    component: AllCategoriesPage,
    parent: 'project',
  },
  {
    name: 'marketplace-categories-customer',
    url: 'marketplace/all/',
    component: AllCategoriesPage,
    parent: 'organization',
  },
  {
    name: 'marketplace-categories-user',
    url: 'marketplace/all/',
    component: AllCategoriesPage,
    parent: 'profile',
  },
  {
    name: 'public.marketplace-categories',
    url: '/marketplace/all/',
    component: AllCategoriesPage,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
  },

  {
    name: 'marketplace-category-project',
    url: 'marketplace-category/:category_uuid/',
    component: CategoryPage,
    parent: 'project',
    data: {
      useExtraTabs: true,
    },
  },
  {
    name: 'marketplace-category-customer',
    url: 'marketplace-category/:category_uuid/',
    component: CategoryPage,
    parent: 'organization',
    data: {
      useExtraTabs: true,
    },
  },
  {
    name: 'marketplace-category-user',
    url: 'marketplace-category/:category_uuid/',
    component: CategoryPage,
    parent: 'profile',
    data: {
      useExtraTabs: true,
    },
  },
  {
    name: 'public.marketplace-category',
    url: '/marketplace-category/:category_uuid/',
    component: CategoryPage,
    data: {
      useExtraTabs: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },

  {
    name: 'marketplace-order-list',
    url: 'marketplace-order-list/',
    component: OrdersList,
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
    name: 'marketplace-provider',
    abstract: true,
    url: '/providers/:uuid/',
    parent: 'layout',
    component: UIView,
    data: {
      auth: true,
      workspace: ORGANIZATION_WORKSPACE,
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
    name: 'provider-marketplace',
    abstract: true,
    parent: 'marketplace-provider',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Marketplace'),
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
    },
  },

  {
    name: 'marketplace-vendor-offerings',
    url: 'marketplace-provider-offerings/?{state}',
    component: ProviderOfferingsList,
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offerings'),
    },
  },

  {
    name: 'marketplace-vendor-offering-users',
    url: 'marketplace-provider-offering-users/',
    component: ProviderOfferingUsersList,
    parent: 'provider-marketplace',
    data: {
      breadcrumb: () => translate('Offering users'),
    },
  },

  {
    name: 'marketplace-provider-organizations',
    parent: 'marketplace-provider-customers',
    url: 'marketplace-provider-organizations/',
    component: ProviderOrganizationsList,
    data: {
      breadcrumb: () => translate('Organizations'),
    },
  },

  {
    name: 'marketplace-provider-users',
    parent: 'marketplace-provider-customers',
    url: 'marketplace-provider-users/',
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
    name: 'marketplace-service-provider',
    url: '/service-providers/',
    abstract: true,
    component: Layout,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    ...getPublicRoutesParams(),
  },

  {
    name: 'marketplace-service-provider.details',
    url: ':uuid/',
    component: PublicServiceProviderDetails,
  },

  {
    name: 'marketplace-service-providers',
    url: '/service-providers/',
    abstract: true,
    component: Layout,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    ...getPublicRoutesParams(),
  },

  {
    name: 'marketplace-service-providers.details',
    url: '',
    component: ServiceProvidersContainer,
  },

  {
    name: 'marketplace-my-offerings',
    url: 'marketplace-my-offerings/',
    component: MyOfferingsListContainer,
    parent: 'organization',
    data: {
      breadcrumb: () => translate('My offerings'),
    },
  },

  {
    name: 'marketplace-offering-create',
    url: 'marketplace-provider-offering-create/',
    component: OfferingCreateContainer,
    parent: 'marketplace-provider',
  },

  {
    name: 'marketplace-offering-update',
    url: 'marketplace-provider-offering-update/:offering_uuid/',
    component: OfferingUpdateContainer,
    parent: 'marketplace-provider',
  },

  {
    name: 'marketplace-offering-images',
    url: 'marketplace-provider-offering-images/:offering_uuid/',
    component: ImagesContainer,
    parent: 'marketplace-provider',
  },

  {
    name: 'marketplace-order-details',
    url: 'marketplace-order-details/:order_uuid/',
    component: OrderDetailsContainer,
    parent: 'project',
  },

  {
    name: 'marketplace-order-item-details',
    url: 'marketplace-order-item-details/:order_item_uuid/',
    component: OrderItemDetailsContainer,
    parent: 'project',
  },

  {
    name: 'marketplace-order-item-details-customer',
    url: 'marketplace-order-item-details/:order_item_uuid/',
    component: OrderItemDetailsContainer,
    parent: 'organization',
  },

  {
    name: 'marketplace-order-details-customer',
    url: 'marketplace-order-details/:order_uuid/',
    component: OrderDetailsContainer,
    parent: 'organization',
  },

  {
    name: 'marketplace-order-items',
    url: 'marketplace-order-items/?{state}',
    component: OrderItemsContainer,
    parent: 'provider-resources',
    data: {
      breadcrumb: () => translate('Orders'),
    },
  },

  {
    name: 'marketplace-my-order-items',
    url: 'marketplace-my-order-items/?filterState',
    component: MyOrderItemsContainer,
    parent: 'organization',
  },

  {
    name: 'marketplace-customer-resources',
    url: 'marketplace-customer-resources/',
    component: CustomerResourcesContainer,
    parent: 'organization-resources',
    data: {
      breadcrumb: () => translate('Resources'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'marketplace-public-resources',
    url: 'marketplace-public-resources/?{state}',
    component: PublicResourcesContainer,
    parent: 'provider-resources',
    data: {
      breadcrumb: () => translate('Resources'),
    },
  },

  {
    name: 'marketplace-public-resource-details',
    url: 'marketplace-public-resource-details/:resource_uuid?tab',
    parent: 'organization',
    ...getResourceDetailsParams,
  },

  {
    name: 'marketplace-service-provider-public-resource-details',
    url: 'marketplace-service-provider-public-resource-details/:resource_uuid?tab',
    parent: 'organization',
    ...getResourceDetailsParams,
  },

  {
    name: 'marketplace-project-resource-details',
    url: 'marketplace-project-resource-details/:resource_uuid?tab',
    parent: 'project',
    ...getResourceDetailsParams,
  },

  {
    name: 'marketplace-support-resources',
    url: 'marketplace-support-resources/',
    component: SupportResourcesContainer,
    parent: 'support',
    data: {
      breadcrumb: () => translate('Resources'),
    },
  },

  {
    name: 'admin.marketplace-offerings',
    url: 'offerings/',
    component: AdminOfferingsListContainer,
    data: {
      breadcrumb: () => translate('Offerings'),
    },
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
    component: SupportOrdersContainer,
    parent: 'admin',
    data: {
      breadcrumb: () => translate('Orders'),
    },
  },

  {
    name: 'marketplace-support-plan-usages',
    url: 'plan-usages/',
    component: PlanUsageContainer,
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Capacity'),
    },
  },

  {
    name: 'marketplace-support-usage-reports',
    url: 'usage/',
    component: SupportUsageContainer,
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Usage reports'),
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
    name: 'marketplace-shopping-cart-item-update',
    url: 'marketplace-shopping-cart-item-update/:order_item_uuid/',
    component: ShoppingCartItemUpdate,
    parent: 'project',
  },

  {
    name: 'marketplace-shopping-cart-item-update-customer',
    url: 'marketplace-shopping-cart-item-update/:order_item_uuid/',
    component: ShoppingCartItemUpdate,
    parent: 'organization',
  },
];
