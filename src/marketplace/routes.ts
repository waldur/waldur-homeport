import { StateDeclaration } from '@waldur/core/types';
import { checkPermission } from '@waldur/issues/utils';
import { SupportOfferings } from '@waldur/marketplace/offerings/customers/SupportOfferings';
import { ResourceDetailsPageForCustomer } from '@waldur/marketplace/resources/ResourceDetailsPageForCustomer';
import { ResourceDetailsPageForServiceProvider } from '@waldur/marketplace/resources/ResourceDetailsPageForServiceProvider';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';

import { CheckoutPage } from './cart/CheckoutPage';
import { ShoppingCartItemUpdate } from './cart/ShoppingCartItemUpdate';
import { CategoryPage } from './category/CategoryPage';
import { ComparisonTable } from './compare/ComparisonTable';
import { OfferingDetailsPage } from './details/DetailsPage';
import { MarketplaceLanding } from './landing/LandingPageContainer';
import { OfferingCreateContainer } from './offerings/create/OfferingCreateContainer';
import { OfferingContainer } from './offerings/details/OfferingContainer';
import { PublicOfferingDetails } from './offerings/details/PublicOfferingDetails';
import { MyOfferingsListContainer } from './offerings/MyOfferingsListContainer';
import { OfferingsListContainer } from './offerings/OfferingsListContainer';
import { ScreenshotsContainer } from './offerings/screenshots/ScreenshotsContainer';
import { OfferingUpdateContainer } from './offerings/update/OfferingUpdateContainer';
import { OrderItemDetailsContainer } from './orders/item/details/OrderItemDetailsContainer';
import { MyOrderItemsContainer } from './orders/item/list/MyOrderItemsContainer';
import { OrderItemsContainer } from './orders/item/list/OrderItemsContainer';
import { SupportOrderItemsContainer } from './orders/item/list/SupportOrderItemsContainer';
import { OrderDetailsContainer } from './orders/OrderDetailsContainer';
import { OrdersList } from './orders/OrdersList';
import { CustomerResourcesContainer } from './resources/list/CustomerResourcesContainer';
import { ProjectResourcesContainer } from './resources/list/ProjectResourcesContainer';
import { PublicResourcesContainer } from './resources/list/PublicResourcesContainer';
import { SupportResourcesContainer } from './resources/list/SupportResourcesContainer';
import { PlanUsageContainer } from './resources/plan-usage/PlanUsageContainer';
import { SupportUsageContainer } from './resources/usage/SupportUsageContainer';
import { ProviderDetails } from './service-providers/ProviderDetails';

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
    component: SupportOfferings,
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
