// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('marketplace-list', {
      url: 'marketplace/',
      template: '<product-grid></product-grid>',
      parent: 'project',
    });
}
