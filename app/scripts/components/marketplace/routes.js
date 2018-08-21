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
        feature: 'marketplace',
      }
    })

    .state('marketplace-compare', {
      url: 'marketplace-compare/',
      template: '<marketplace-compare></marketplace-compare>',
      parent: 'project',
      data: {
        pageTitle: gettext('Compare items'),
        feature: 'marketplace',
      }
    })

    .state('marketplace-checkout', {
      url: 'marketplace-checkout/',
      template: '<marketplace-checkout></marketplace-checkout>',
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace checkout'),
        feature: 'marketplace',
      }
    })

    .state('marketplace-offering', {
      url: 'marketplace-offering/:offering_uuid/',
      template: '<marketplace-offering></marketplace-offering>',
      parent: 'project',
      data: {
        pageTitle: gettext('Product details'),
        feature: 'marketplace',
      }
    })

    .state('marketplace-list', {
      url: 'marketplace-list/:category_uuid/',
      template: '<marketplace-list></marketplace-list>',
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace offerings'),
        feature: 'marketplace',
      }
    })

    .state('marketplace-order-list', {
      url: 'marketplace-order-list/',
      template: '<marketplace-orders-list></marketplace-orders-list>',
      parent: 'project',
      data: {
        pageTitle: gettext('Marketplace orders'),
        feature: 'marketplace',
      }
    })

    .state('marketplace-provider-details', {
      url: 'marketplace-provider-details/:customer_uuid/',
      template: '<marketplace-provider-details></marketplace-provider-details>',
      parent: 'project',
      data: {
        pageTitle: gettext('Provider details'),
        feature: 'marketplace',
      }
    })

    .state('marketplace-vendor-offerings', {
      url: 'marketplace-offerings/',
      template: '<marketplace-vendor-offerings></marketplace-vendor-offerings>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Offerings'),
        feature: 'marketplace',
      }
    })

    .state('marketplace-offering-create', {
      url: 'marketplace-offering-create/',
      template: '<marketplace-offering-create></marketplace-offering-create>',
      parent: 'organization',
      data: {
        pageTitle: gettext('Add offering'),
        feature: 'marketplace',
      }
    })

    .state('marketplace-order-details', {
      url: 'marketplace-order-details/:order_uuid/',
      template: '<marketplace-order-details></marketplace-order-details>',
      parent: 'project',
      data: {
        pageTitle: gettext('Order details'),
        feature: 'marketplace',
      }
    });
}
