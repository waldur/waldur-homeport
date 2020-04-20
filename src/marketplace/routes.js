import { checkPermission } from '@waldur/issues/routes';

// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('marketplace-landing', {
      url: 'marketplace/',
      template: '<marketplace-landing></marketplace-landing>',
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace'),
        hideBreadcrumbs: true,
      },
    })

    .state('marketplace-landing-customer', {
      url: 'marketplace/',
      template: '<marketplace-landing></marketplace-landing>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Marketplace'),
        hideBreadcrumbs: true,
      },
    })

    .state('marketplace-compare', {
      url: 'marketplace-compare/',
      template: '<marketplace-compare></marketplace-compare>',
      parent: 'project',
      data: {
        pageTitle: gettext('Compare items'),
      },
    })

    .state('marketplace-compare-customer', {
      url: 'marketplace-compare/',
      template: '<marketplace-compare></marketplace-compare>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Compare items'),
      },
    })

    .state('marketplace-checkout', {
      url: 'marketplace-checkout/',
      template: '<marketplace-checkout></marketplace-checkout>',
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace checkout'),
      },
    })

    .state('marketplace-offering', {
      url: 'marketplace-offering/:offering_uuid/',
      template: '<marketplace-offering></marketplace-offering>',
      parent: 'project',
      data: {
        pageTitle: gettext('Offering details'),
      },
    })

    .state('marketplace-offering-customer', {
      url: 'marketplace-offering/:offering_uuid/',
      template: '<marketplace-offering></marketplace-offering>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Offering details'),
      },
    })

    .state('marketplace-offering-details', {
      url: 'marketplace-offering-details/:offering_uuid/',
      template:
        '<marketplace-offering-details-page></marketplace-offering-details-page>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Offering details'),
      },
    })

    .state('marketplace-public-offering', {
      url: '/marketplace-public-offering/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
      data: {
        hideHeader: true,
      },
    })

    .state('marketplace-public-offering.details', {
      url: ':uuid/',
      template:
        '<marketplace-public-offering-details-page></marketplace-public-offering-details>',
      data: {
        pageTitle: gettext('Offering details'),
      },
    })

    .state('marketplace-category', {
      url: 'marketplace-category/:category_uuid/',
      template: '<marketplace-category></marketplace-category>',
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace offerings'),
      },
    })

    .state('marketplace-category-customer', {
      url: 'marketplace-category/:category_uuid/',
      template: '<marketplace-category></marketplace-category>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Marketplace offerings'),
      },
    })

    .state('marketplace-order-list', {
      url: 'marketplace-order-list/',
      template: '<marketplace-orders-list></marketplace-orders-list>',
      parent: 'project',
      data: {
        pageTitle: gettext('My orders'),
      },
    })

    .state('marketplace-provider-details', {
      url: 'marketplace-provider-details/:customer_uuid/',
      template: '<marketplace-provider-details></marketplace-provider-details>',
      parent: 'project',
      data: {
        pageTitle: gettext('Provider details'),
      },
    })

    .state('marketplace-provider-details-customer', {
      url: 'marketplace-provider-details/:customer_uuid/',
      template: '<marketplace-provider-details></marketplace-provider-details>',
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
      template: '<marketplace-vendor-offerings></marketplace-vendor-offerings>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Public offerings'),
      },
    })

    .state('marketplace-my-offerings', {
      url: 'marketplace-my-offerings/',
      template: '<marketplace-my-offerings></marketplace-my-offerings>',
      parent: 'organization',
      data: {
        pageTitle: gettext('My offerings'),
      },
    })

    .state('marketplace-offering-create', {
      url: 'marketplace-offering-create/',
      template: '<marketplace-offering-create></marketplace-offering-create>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Add offering'),
      },
    })

    .state('marketplace-offering-update', {
      url: 'marketplace-offering-update/:offering_uuid/',
      template: '<marketplace-offering-update></marketplace-offering-update>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Update offering'),
        renderDocumentTitle: true,
      },
    })

    .state('marketplace-order-details', {
      url: 'marketplace-order-details/:order_uuid/',
      template: '<marketplace-order-details></marketplace-order-details>',
      parent: 'project',
      data: {
        pageTitle: gettext('Order details'),
      },
    })

    .state('marketplace-order-item-details', {
      url: 'marketplace-order-item-details/:order_item_uuid/',
      template:
        '<marketplace-order-item-details></marketplace-order-item-details>',
      parent: 'project',
      data: {
        pageTitle: gettext('Order item details'),
        renderDocumentTitle: true,
      },
    })

    .state('marketplace-order-item-details-customer', {
      url: 'marketplace-order-item-details/:order_item_uuid/',
      template:
        '<marketplace-order-item-details></marketplace-order-item-details>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Order item details'),
        renderDocumentTitle: true,
      },
    })

    .state('marketplace-order-details-customer', {
      url: 'marketplace-order-details/:order_uuid/',
      template: '<marketplace-order-details></marketplace-order-details>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Order details'),
      },
    })

    .state('marketplace-order-items', {
      url: 'marketplace-order-items/',
      template: '<marketplace-order-items-list></marketplace-order-items-list>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Public orders'),
      },
    })

    .state('marketplace-my-order-items', {
      url: 'marketplace-my-order-items/?filterState',
      template:
        '<marketplace-my-order-items-list></marketplace-my-order-items-list>',
      parent: 'organization',
      data: {
        pageTitle: gettext('My orders'),
      },
    })

    .state('marketplace-customer-resources', {
      url: 'marketplace-customer-resources/',
      template:
        '<marketplace-customer-resources-list></marketplace-customer-resources-list>',
      parent: 'organization',
      data: {
        pageTitle: gettext('My resources'),
      },
    })

    .state('marketplace-public-resources', {
      url: 'marketplace-public-resources/',
      template:
        '<marketplace-public-resources-list></marketplace-public-resources-list>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Public resources'),
      },
    })

    .state('marketplace-public-resource-details', {
      url: 'marketplace-public-resource-details/:resource_uuid/',
      template: '<marketplace-resource-details></marketplace-resource-details>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Public resources'),
      },
    })

    .state('marketplace-support-resources', {
      url: 'marketplace-support-resources/',
      template:
        '<marketplace-support-resources-list></marketplace-support-resources-list>',
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
      template:
        '<marketplace-support-order-items-list></marketplace-support-order-items-list>',
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
      template: '<marketplace-plan-usages-list></marketplace-plan-usages-list>',
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
      template:
        '<marketplace-support-usage-list></marketplace-support-usage-list>',
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
      template:
        '<marketplace-project-resources-list></marketplace-project-resources-list>',
      parent: 'project',
      data: {
        pageTitle: gettext('Resources'),
      },
    })

    .state('marketplace-shopping-cart-item-update', {
      url: 'marketplace-shopping-cart-item-update/:order_item_uuid/',
      template:
        '<marketplace-shopping-cart-item-update></marketplace-shopping-cart-item-update>',
      parent: 'project',
      data: {
        pageTitle: gettext('Shopping cart item update'),
      },
    })

    .state('marketplace-shopping-cart-item-update-customer', {
      url: 'marketplace-shopping-cart-item-update/:order_item_uuid/',
      template:
        '<marketplace-shopping-cart-item-update></marketplace-shopping-cart-item-update>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Shopping cart item update'),
      },
    });
}
