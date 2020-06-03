import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { checkPermission } from '@waldur/issues/utils';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';

import { CheckoutPage } from './cart/CheckoutPage';
import { ShoppingCartItemUpdate } from './cart/ShoppingCartItemUpdate';
import { CategoryPage } from './category/CategoryPage';
import { MarketplaceComparison } from './compare/ComparisonContainer';
import { OfferingDetailsPage } from './details/DetailsPage';
import { MarketplaceLanding } from './landing/LandingPageContainer';
import { OfferingCreateContainer } from './offerings/create/OfferingCreateContainer';
import { OfferingContainer } from './offerings/details/OfferingContainer';
import { PublicOfferingDetails } from './offerings/details/PublicOfferingDetails';
import { MyOfferingsListContainer } from './offerings/MyOfferingsListContainer';
import { OfferingScreenshotsContainer } from './offerings/OfferingScreenshotsContainer';
import { OfferingsListContainer } from './offerings/OfferingsListContainer';
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
import { ResourceDetailsPage } from './resources/ResourceDetailsPage';
import { SupportUsageContainer } from './resources/usage/SupportUsageContainer';
import { ProviderDetails } from './service-providers/ProviderDetails';

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-landing',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'project',
    data: {
      pageTitle: gettext('Marketplace'),
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'marketplace-landing-customer',
    url: 'marketplace/',
    component: MarketplaceLanding,
    parent: 'organization',
    data: {
      pageTitle: gettext('Marketplace'),
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'marketplace-compare',
    url: 'marketplace-compare/',
    component: MarketplaceComparison,
    parent: 'project',
    data: {
      pageTitle: gettext('Compare items'),
    },
  },

  {
    name: 'marketplace-compare-customer',
    url: 'marketplace-compare/',
    component: MarketplaceComparison,
    parent: 'organization',
    data: {
      pageTitle: gettext('Compare items'),
    },
  },

  {
    name: 'marketplace-checkout',
    url: 'marketplace-checkout/',
    component: CheckoutPage,
    parent: 'project',
    data: {
      pageTitle: gettext('Marketplace checkout'),
    },
  },

  {
    name: 'marketplace-offering',
    url: 'marketplace-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'project',
    data: {
      pageTitle: gettext('Offering details'),
    },
  },

  {
    name: 'marketplace-offering-customer',
    url: 'marketplace-offering/:offering_uuid/',
    component: OfferingDetailsPage,
    parent: 'organization',
    data: {
      pageTitle: gettext('Offering details'),
    },
  },

  {
    name: 'marketplace-offering-details',
    url: 'marketplace-offering-details/:offering_uuid/',
    component: OfferingContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Offering details'),
    },
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
    data: {
      pageTitle: gettext('Offering details'),
    },
  },

  {
    name: 'marketplace-category',
    url: 'marketplace-category/:category_uuid/',
    component: CategoryPage,
    parent: 'project',
    data: {
      pageTitle: gettext('Marketplace offerings'),
    },
  },

  {
    name: 'marketplace-category-customer',
    url: 'marketplace-category/:category_uuid/',
    component: CategoryPage,
    parent: 'organization',
    data: {
      pageTitle: gettext('Marketplace offerings'),
    },
  },

  {
    name: 'marketplace-order-list',
    url: 'marketplace-order-list/',
    component: OrdersList,
    parent: 'project',
    data: {
      pageTitle: gettext('My orders'),
    },
  },

  {
    name: 'marketplace-provider-details',
    url: 'marketplace-provider-details/:customer_uuid/',
    component: ProviderDetails,
    parent: 'project',
    data: {
      pageTitle: gettext('Provider details'),
    },
  },

  {
    name: 'marketplace-provider-details-customer',
    url: 'marketplace-provider-details/:customer_uuid/',
    component: ProviderDetails,
    parent: 'organization',
    data: {
      pageTitle: gettext('Provider details'),
    },
  },

  {
    name: 'marketplace-vendor-offerings',
    url: 'marketplace-offerings/',
    component: OfferingsListContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Public offerings'),
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-my-offerings',
    url: 'marketplace-my-offerings/',
    component: MyOfferingsListContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('My offerings'),
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-offering-create',
    url: 'marketplace-offering-create/',
    component: OfferingCreateContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Add offering'),
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-offering-update',
    url: 'marketplace-offering-update/:offering_uuid/',
    component: OfferingUpdateContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Update offering'),
      renderDocumentTitle: true,
    },
  },

  {
    name: 'marketplace-offering-screenshots',
    url: 'marketplace-offering-screenshots/:offering_uuid/',
    component: OfferingScreenshotsContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Screenshots'),
      sidebarKey: 'marketplace-services',
      renderDocumentTitle: true,
    },
  },

  {
    name: 'marketplace-order-details',
    url: 'marketplace-order-details/:order_uuid/',
    component: OrderDetailsContainer,
    parent: 'project',
    data: {
      pageTitle: gettext('Order details'),
    },
  },

  {
    name: 'marketplace-order-item-details',
    url: 'marketplace-order-item-details/:order_item_uuid/',
    component: OrderItemDetailsContainer,
    parent: 'project',
    data: {
      pageTitle: gettext('Order item details'),
      renderDocumentTitle: true,
    },
  },

  {
    name: 'marketplace-order-item-details-customer',
    url: 'marketplace-order-item-details/:order_item_uuid/',
    component: OrderItemDetailsContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Order item details'),
      renderDocumentTitle: true,
    },
  },

  {
    name: 'marketplace-order-details-customer',
    url: 'marketplace-order-details/:order_uuid/',
    component: OrderDetailsContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Order details'),
    },
  },

  {
    name: 'marketplace-order-items',
    url: 'marketplace-order-items/',
    component: OrderItemsContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Public orders'),
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-my-order-items',
    url: 'marketplace-my-order-items/?filterState',
    component: MyOrderItemsContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('My orders'),
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-customer-resources',
    url: 'marketplace-customer-resources/',
    component: CustomerResourcesContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('My resources'),
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-public-resources',
    url: 'marketplace-public-resources/',
    component: PublicResourcesContainer,
    parent: 'organization',
    data: {
      pageTitle: gettext('Public resources'),
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-public-resource-details',
    url: 'marketplace-public-resource-details/:resource_uuid/',
    component: ResourceDetailsPage,
    parent: 'organization',
    data: {
      pageTitle: gettext('Public resources'),
      sidebarKey: 'marketplace-services',
    },
  },

  {
    name: 'marketplace-support-resources',
    url: 'marketplace-support-resources/',
    component: SupportResourcesContainer,
    parent: 'support',
    data: {
      pageTitle: gettext('Resources'),
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-order-items',
    url: 'order-items/',
    component: SupportOrderItemsContainer,
    parent: 'support',
    data: {
      pageTitle: gettext('Orders'),
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-plan-usages',
    url: 'plan-usages/',
    component: PlanUsageContainer,
    parent: 'support',
    data: {
      pageTitle: gettext('Plan capacity'),
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-support-usage-reports',
    url: 'usage-reports/',
    component: SupportUsageContainer,
    parent: 'support',
    data: {
      pageTitle: gettext('Usage reports'),
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'marketplace-project-resources',
    url: 'marketplace-resources/:category_uuid/',
    component: ProjectResourcesContainer,
    parent: 'project',
    data: {
      pageTitle: gettext('Resources'),
    },
  },

  {
    name: 'marketplace-shopping-cart-item-update',
    url: 'marketplace-shopping-cart-item-update/:order_item_uuid/',
    component: ShoppingCartItemUpdate,
    parent: 'project',
    data: {
      pageTitle: gettext('Shopping cart item update'),
    },
  },

  {
    name: 'marketplace-shopping-cart-item-update-customer',
    url: 'marketplace-shopping-cart-item-update/:order_item_uuid/',
    component: ShoppingCartItemUpdate,
    parent: 'organization',
    data: {
      pageTitle: gettext('Shopping cart item update'),
    },
  },
];
