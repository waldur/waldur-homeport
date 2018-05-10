// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('marketplace-list', {
      url: 'marketplace/',
      template: '<marketplace-landing></marketplace-landing>',
      parent: 'project',
      feature: 'marketplace',
      data: {
        pageTitle: gettext('Marketplace'),
        hideHeader: true,
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
