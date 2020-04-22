import { checkPermission } from '@waldur/issues/routes';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

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

// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('marketplace-landing', {
      url: 'marketplace/',
      component: withStore(MarketplaceLanding),
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace'),
        hideBreadcrumbs: true,
      },
    })

    .state('marketplace-landing-customer', {
      url: 'marketplace/',
      component: withStore(MarketplaceLanding),
      parent: 'organization',
      data: {
        pageTitle: gettext('Marketplace'),
        hideBreadcrumbs: true,
      },
    })

    .state('marketplace-compare', {
      url: 'marketplace-compare/',
      component: withStore(MarketplaceComparison),
      parent: 'project',
      data: {
        pageTitle: gettext('Compare items'),
      },
    })

    .state('marketplace-compare-customer', {
      url: 'marketplace-compare/',
      component: withStore(MarketplaceComparison),
      parent: 'organization',
      data: {
        pageTitle: gettext('Compare items'),
      },
    })

    .state('marketplace-checkout', {
      url: 'marketplace-checkout/',
      component: withStore(CheckoutPage),
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace checkout'),
      },
    })

    .state('marketplace-offering', {
      url: 'marketplace-offering/:offering_uuid/',
      component: withStore(OfferingDetailsPage),
      parent: 'project',
      data: {
        pageTitle: gettext('Offering details'),
      },
    })

    .state('marketplace-offering-customer', {
      url: 'marketplace-offering/:offering_uuid/',
      component: withStore(OfferingDetailsPage),
      parent: 'organization',
      data: {
        pageTitle: gettext('Offering details'),
      },
    })

    .state('marketplace-offering-details', {
      url: 'marketplace-offering-details/:offering_uuid/',
      component: withStore(OfferingContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('Offering details'),
      },
    })

    .state('marketplace-public-offering', {
      url: '/marketplace-public-offering/',
      abstract: true,
      component: withStore(AnonymousLayout),
      data: {
        hideHeader: true,
      },
    })

    .state('marketplace-public-offering.details', {
      url: ':uuid/',
      component: withStore(PublicOfferingDetails),
      data: {
        pageTitle: gettext('Offering details'),
      },
    })

    .state('marketplace-category', {
      url: 'marketplace-category/:category_uuid/',
      component: withStore(CategoryPage),
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace offerings'),
      },
    })

    .state('marketplace-category-customer', {
      url: 'marketplace-category/:category_uuid/',
      component: withStore(CategoryPage),
      parent: 'organization',
      data: {
        pageTitle: gettext('Marketplace offerings'),
      },
    })

    .state('marketplace-order-list', {
      url: 'marketplace-order-list/',
      component: withStore(OrdersList),
      parent: 'project',
      data: {
        pageTitle: gettext('My orders'),
      },
    })

    .state('marketplace-provider-details', {
      url: 'marketplace-provider-details/:customer_uuid/',
      component: withStore(ProviderDetails),
      parent: 'project',
      data: {
        pageTitle: gettext('Provider details'),
      },
    })

    .state('marketplace-provider-details-customer', {
      url: 'marketplace-provider-details/:customer_uuid/',
      component: withStore(ProviderDetails),
      parent: 'organization',
      data: {
        pageTitle: gettext('Provider details'),
      },
    })

    .state('marketplace-services', {
      url: '',
      abstract: true,
      template: '<ui-view></ui-view>',
    })

    .state('marketplace-vendor-offerings', {
      url: 'marketplace-offerings/',
      component: withStore(OfferingsListContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('Public offerings'),
      },
    })

    .state('marketplace-my-offerings', {
      url: 'marketplace-my-offerings/',
      component: withStore(MyOfferingsListContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('My offerings'),
      },
    })

    .state('marketplace-offering-create', {
      url: 'marketplace-offering-create/',
      component: withStore(OfferingCreateContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('Add offering'),
      },
    })

    .state('marketplace-offering-update', {
      url: 'marketplace-offering-update/:offering_uuid/',
      component: withStore(OfferingUpdateContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('Update offering'),
        renderDocumentTitle: true,
      },
    })

    .state('marketplace-order-details', {
      url: 'marketplace-order-details/:order_uuid/',
      component: withStore(OrderDetailsContainer),
      parent: 'project',
      data: {
        pageTitle: gettext('Order details'),
      },
    })

    .state('marketplace-order-item-details', {
      url: 'marketplace-order-item-details/:order_item_uuid/',
      component: withStore(OrderItemDetailsContainer),
      parent: 'project',
      data: {
        pageTitle: gettext('Order item details'),
        renderDocumentTitle: true,
      },
    })

    .state('marketplace-order-item-details-customer', {
      url: 'marketplace-order-item-details/:order_item_uuid/',
      component: withStore(OrderItemDetailsContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('Order item details'),
        renderDocumentTitle: true,
      },
    })

    .state('marketplace-order-details-customer', {
      url: 'marketplace-order-details/:order_uuid/',
      component: withStore(OrderDetailsContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('Order details'),
      },
    })

    .state('marketplace-order-items', {
      url: 'marketplace-order-items/',
      component: withStore(OrderItemsContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('Public orders'),
      },
    })

    .state('marketplace-my-order-items', {
      url: 'marketplace-my-order-items/?filterState',
      component: withStore(MyOrderItemsContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('My orders'),
      },
    })

    .state('marketplace-customer-resources', {
      url: 'marketplace-customer-resources/',
      component: withStore(CustomerResourcesContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('My resources'),
      },
    })

    .state('marketplace-public-resources', {
      url: 'marketplace-public-resources/',
      component: withStore(PublicResourcesContainer),
      parent: 'organization',
      data: {
        pageTitle: gettext('Public resources'),
      },
    })

    .state('marketplace-public-resource-details', {
      url: 'marketplace-public-resource-details/:resource_uuid/',
      component: withStore(ResourceDetailsPage),
      parent: 'organization',
      data: {
        pageTitle: gettext('Public resources'),
      },
    })

    .state('marketplace-support-resources', {
      url: 'marketplace-support-resources/',
      component: withStore(SupportResourcesContainer),
      parent: 'support',
      data: {
        pageTitle: gettext('Resources'),
      },
      resolve: {
        permission: checkPermission,
      },
    })

    .state('marketplace-support-order-items', {
      url: 'order-items/',
      component: withStore(SupportOrderItemsContainer),
      parent: 'support',
      data: {
        pageTitle: gettext('Orders'),
      },
      resolve: {
        permission: checkPermission,
      },
    })

    .state('marketplace-support-plan-usages', {
      url: 'plan-usages/',
      component: withStore(PlanUsageContainer),
      parent: 'support',
      data: {
        pageTitle: gettext('Plan capacity'),
      },
      resolve: {
        permission: checkPermission,
      },
    })

    .state('marketplace-support-usage-reports', {
      url: 'usage-reports/',
      component: withStore(SupportUsageContainer),
      parent: 'support',
      data: {
        pageTitle: gettext('Usage reports'),
      },
      resolve: {
        permission: checkPermission,
      },
    })

    .state('marketplace-resources', {
      url: '',
      abstract: true,
      template: '<ui-view></ui-view>',
    })

    .state('marketplace-project-resources', {
      url: 'marketplace-resources/:category_uuid/',
      component: withStore(ProjectResourcesContainer),
      parent: 'project',
      data: {
        pageTitle: gettext('Resources'),
      },
    })

    .state('marketplace-shopping-cart-item-update', {
      url: 'marketplace-shopping-cart-item-update/:order_item_uuid/',
      component: withStore(ShoppingCartItemUpdate),
      parent: 'project',
      data: {
        pageTitle: gettext('Shopping cart item update'),
      },
    })

    .state('marketplace-shopping-cart-item-update-customer', {
      url: 'marketplace-shopping-cart-item-update/:order_item_uuid/',
      component: withStore(ShoppingCartItemUpdate),
      parent: 'organization',
      data: {
        pageTitle: gettext('Shopping cart item update'),
      },
    });
}
