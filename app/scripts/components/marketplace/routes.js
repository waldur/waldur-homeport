// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('marketplace-list', {
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

    .state('marketplace-product', {
      url: 'marketplace-product/',
      template: '<marketplace-product></marketplace-product>',
      parent: 'project',
      data: {
        pageTitle: gettext('Product details'),
        feature: 'marketplace',
      }
    });

}
