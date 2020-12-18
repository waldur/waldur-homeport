import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { checkPermission } from '@waldur/issues/utils';

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
const PublicOfferingDetails = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PublicOfferingDetails" */ './offerings/details/PublicOfferingDetails'
    ),
  'PublicOfferingDetails',
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
const ScreenshotsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingScreenshotsContainer" */ './offerings/screenshots/ScreenshotsContainer'
    ),
  'ScreenshotsContainer',
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
const SupportOrderItemsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportOrderItemsContainer" */ './orders/item/list/SupportOrderItemsContainer'
    ),
  'SupportOrderItemsContainer',
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
    name: 'marketplace-landing',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'project',
    data: {
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'marketplace-landing-customer',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'organization',
    data: {
      hideBreadcrumbs: true,
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
    name: 'marketplace-offering',
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
    data: {
      hideHeader: true,
    },
  },

  {
    name: 'marketplace-public-offering.details',
    url: ':uuid/',
    component: PublicOfferingDetails,
  },

  {
    name: 'marketplace-category',
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
    name: 'marketplace-vendor-offerings',
    url: 'marketplace-offerings/',
    component: OfferingsListContainer,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-my-offerings',
    url: 'marketplace-my-offerings/',
    component: MyOfferingsListContainer,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-offering-create',
    url: 'marketplace-offering-create/',
    component: OfferingCreateContainer,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-offering-update',
    url: 'marketplace-offering-update/:offering_uuid/',
    component: OfferingUpdateContainer,
    parent: 'organization',
  },

  {
    name: 'marketplace-offering-screenshots',
    url: 'marketplace-offering-screenshots/:offering_uuid/',
    component: ScreenshotsContainer,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
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
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-my-order-items',
    url: 'marketplace-my-order-items/?filterState',
    component: MyOrderItemsContainer,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-customer-resources',
    url: 'marketplace-customer-resources/',
    component: CustomerResourcesContainer,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-public-resources',
    url: 'marketplace-public-resources/',
    component: PublicResourcesContainer,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-public-resource-details',
    url: 'marketplace-public-resource-details/:resource_uuid/',
    component: ResourceDetailsPageForCustomer,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-service-provider-public-resource-details',
    url: 'marketplace-service-provider-public-resource-details/:resource_uuid/',
    component: ResourceDetailsPageForServiceProvider,
    parent: 'organization',
    data: {
      sidebarKey: 'marketplace-services',
    },
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
    parent: 'support',
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-order-items',
    url: 'order-items/',
    component: SupportOrderItemsContainer,
    parent: 'support',
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-plan-usages',
    url: 'plan-usages/',
    component: PlanUsageContainer,
    parent: 'support',
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-usage-reports',
    url: 'usage-reports/',
    component: SupportUsageContainer,
    parent: 'support',
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
