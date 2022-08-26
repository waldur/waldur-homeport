import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { fetchCustomer } from '@waldur/customer/workspace/CustomerWorkspace';
import { checkPermission } from '@waldur/issues/utils';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

const SupportOfferingsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportOfferingsContainer" */ '@waldur/marketplace/offerings/support/SupportOfferingsContainer'
    ),
  'SupportOfferingsContainer',
);
const ResourceDetailsPageForCustomer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceDetailsPageForCustomer" */ '@waldur/marketplace/resources/ResourceDetailsPageForCustomer'
    ),
  'ResourceDetailsPageForCustomer',
);
const ResourceDetailsPageForServiceProvider = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceDetailsPageForServiceProvider" */

      '@waldur/marketplace/resources/ResourceDetailsPageForServiceProvider'
    ),
  'ResourceDetailsPageForServiceProvider',
);
const ResourceDetailsPageForProjectWorkspace = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceDetailsPageForProjectWorkspace" */

      '@waldur/marketplace/resources/ResourceDetailsPageForProjectWorkspace'
    ),
  'ResourceDetailsPageForProjectWorkspace',
);
const AnonymousLayout = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AnonymousLayout" */ '@waldur/navigation/AnonymousLayout'
    ),
  'AnonymousLayout',
);
const CheckoutPage = lazyComponent(
  () => import(/* webpackChunkName: "CheckoutPage" */ './cart/CheckoutPage'),
  'CheckoutPage',
);
const ShoppingCartItemUpdate = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ShoppingCartItemUpdate" */ './cart/ShoppingCartItemUpdate'
    ),
  'ShoppingCartItemUpdate',
);
const CategoryPage = lazyComponent(
  () =>
    import(/* webpackChunkName: "CategoryPage" */ './category/CategoryPage'),
  'CategoryPage',
);
const ComparisonTable = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ComparisonTable" */ './compare/ComparisonTable'
    ),
  'ComparisonTable',
);
const OfferingDetailsPage = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingDetailsPage" */ './details/DetailsPage'
    ),
  'OfferingDetailsPage',
);
const MarketplaceLanding = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "MarketplaceLanding" */ './landing/LandingPageContainer'
    ),
  'MarketplaceLanding',
);
const OfferingCreateContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingCreateContainer" */ './offerings/create/OfferingCreateContainer'
    ),
  'OfferingCreateContainer',
);
const OfferingContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingContainer" */ './offerings/details/OfferingContainer'
    ),
  'OfferingContainer',
);
const PublicOfferingDetailsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PublicOfferingDetailsContainer" */ './offerings/details/PublicOfferingDetailsContainer'
    ),
  'PublicOfferingDetailsContainer',
);
const MyOfferingsListContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "MyOfferingsListContainer" */ './offerings/MyOfferingsListContainer'
    ),
  'MyOfferingsListContainer',
);
const OfferingsListContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingsListContainer" */ './offerings/OfferingsListContainer'
    ),
  'OfferingsListContainer',
);
const PublicServiceProviderDetails = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PublicServiceProviderDetails" */ './offerings/service-providers/PublicServiceProviderDetails'
    ),
  'PublicServiceProviderDetails',
);
const ServiceProvidersContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ServiceProvidersContainer" */ './offerings/service-providers/ServiceProvidersContainer'
    ),
  'ServiceProvidersContainer',
);
const ImagesContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingImagesContainer" */ './offerings/images/ImagesContainer'
    ),
  'ImagesContainer',
);
const OfferingUpdateContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingUpdateContainer" */ './offerings/update/OfferingUpdateContainer'
    ),
  'OfferingUpdateContainer',
);
const OrderItemDetailsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OrderItemDetailsContainer" */ './orders/item/details/OrderItemDetailsContainer'
    ),
  'OrderItemDetailsContainer',
);
const MyOrderItemsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "MyOrderItemsContainer" */ './orders/item/list/MyOrderItemsContainer'
    ),
  'MyOrderItemsContainer',
);
const OrderItemsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OrderItemsContainer" */ './orders/item/list/OrderItemsContainer'
    ),
  'OrderItemsContainer',
);
const SupportOrdersContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportOrdersContainer" */ './orders/SupportOrdersContainer'
    ),
  'SupportOrdersContainer',
);
const OrderDetailsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OrderDetailsContainer" */ './orders/OrderDetailsContainer'
    ),
  'OrderDetailsContainer',
);
const OrdersList = lazyComponent(
  () => import(/* webpackChunkName: "OrdersList" */ './orders/OrdersList'),
  'OrdersList',
);
const CustomerResourcesContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerResourcesContainer" */ './resources/list/CustomerResourcesContainer'
    ),
  'CustomerResourcesContainer',
);
const ProjectResourcesContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectResourcesContainer" */ './resources/list/ProjectResourcesContainer'
    ),
  'ProjectResourcesContainer',
);
const ProjectResourcesAllContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectResourcesAllContainer" */ './resources/list/ProjectResourcesAllContainer'
    ),
  'ProjectResourcesAllContainer',
);
const PublicResourcesContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PublicResourcesContainer" */ './resources/list/PublicResourcesContainer'
    ),
  'PublicResourcesContainer',
);
const SupportResourcesContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportResourcesContainer" */ './resources/list/SupportResourcesContainer'
    ),
  'SupportResourcesContainer',
);
const PlanUsageContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PlanUsageContainer" */ './resources/plan-usage/PlanUsageContainer'
    ),
  'PlanUsageContainer',
);
const SupportUsageContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportUsageContainer" */ './resources/usage/SupportUsageContainer'
    ),
  'SupportUsageContainer',
);
const ProviderDetails = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProviderDetails" */ './service-providers/ProviderDetails'
    ),
  'ProviderDetails',
);

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-landing-project',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'project',
  },

  {
    name: 'marketplace-landing-customer',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'organization',
  },

  {
    name: 'marketplace-landing-user',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'profile',
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
    url: 'marketplace-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'project',
  },

  {
    name: 'marketplace-offering-customer',
    url: 'marketplace-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'organization',
  },

  {
    name: 'marketplace-offering-user',
    url: 'marketplace-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'profile',
  },

  {
    name: 'marketplace-offering-details',
    url: 'marketplace-offering-details/:offering_uuid/',
    component: OfferingContainer,
    parent: 'organization',
  },

  {
    name: 'marketplace-public-offering',
    url: '/marketplace-public-offering/',
    abstract: true,
    component: AnonymousLayout,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
  },

  {
    name: 'marketplace-public-offering.details',
    url: ':uuid/',
    component: PublicOfferingDetailsContainer,
  },

  {
    name: 'marketplace-category-project',
    url: 'marketplace-category/:category_uuid/',
    component: CategoryPage,
    parent: 'project',
  },

  {
    name: 'marketplace-category-customer',
    url: 'marketplace-category/:category_uuid/',
    component: CategoryPage,
    parent: 'organization',
  },

  {
    name: 'marketplace-category-user',
    url: 'marketplace-category/:category_uuid/',
    component: CategoryPage,
    parent: 'profile',
  },

  {
    name: 'marketplace-order-list',
    url: 'marketplace-order-list/',
    component: OrdersList,
    parent: 'project',
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
    },
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
    ],
  },

  {
    name: 'marketplace-vendor-offerings',
    url: 'marketplace-offerings/',
    component: OfferingsListContainer,
    parent: 'marketplace-provider',
  },

  {
    name: 'marketplace-service-provider',
    url: '/service-providers/',
    abstract: true,
    component: AnonymousLayout,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
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
    component: AnonymousLayout,
    data: ANONYMOUS_LAYOUT_ROUTE_CONFIG,
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
  },

  {
    name: 'marketplace-offering-create',
    url: 'marketplace-offering-create/',
    component: OfferingCreateContainer,
    parent: 'organization',
  },

  {
    name: 'marketplace-offering-update',
    url: 'marketplace-offering-update/:offering_uuid/',
    component: OfferingUpdateContainer,
    parent: 'organization',
  },

  {
    name: 'marketplace-offering-images',
    url: 'marketplace-offering-images/:offering_uuid/',
    component: ImagesContainer,
    parent: 'organization',
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
    url: 'marketplace-order-items/',
    component: OrderItemsContainer,
    parent: 'marketplace-provider',
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
    parent: 'organization',
  },

  {
    name: 'marketplace-public-resources',
    url: 'marketplace-public-resources/',
    component: PublicResourcesContainer,
    parent: 'marketplace-provider',
  },

  {
    name: 'marketplace-public-resource-details',
    url: 'marketplace-public-resource-details/:resource_uuid/',
    component: ResourceDetailsPageForCustomer,
    parent: 'organization',
  },

  {
    name: 'marketplace-service-provider-public-resource-details',
    url: 'marketplace-service-provider-public-resource-details/:resource_uuid/',
    component: ResourceDetailsPageForServiceProvider,
    parent: 'organization',
  },

  {
    name: 'marketplace-project-resource-details',
    url: 'marketplace-project-resource-details/:resource_uuid/',
    component: ResourceDetailsPageForProjectWorkspace,
    parent: 'project',
  },

  {
    name: 'marketplace-support-resources',
    url: 'marketplace-support-resources/',
    component: SupportResourcesContainer,
    parent: 'support',
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-offerings',
    url: 'offerings/',
    component: SupportOfferingsContainer,
    parent: 'admin',
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-orders',
    url: 'orders/',
    component: SupportOrdersContainer,
    parent: 'admin',
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-plan-usages',
    url: 'plan-usages/',
    component: PlanUsageContainer,
    parent: 'reporting',
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-usage-reports',
    url: 'usage/',
    component: SupportUsageContainer,
    parent: 'reporting',
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-project-resources',
    url: 'marketplace-resources/:category_uuid/',
    component: ProjectResourcesContainer,
    parent: 'project',
  },

  {
    name: 'marketplace-project-resources-all',
    url: 'marketplace-resources/',
    component: ProjectResourcesAllContainer,
    parent: 'project',
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
