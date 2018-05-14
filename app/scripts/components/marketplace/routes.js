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
    });
}
