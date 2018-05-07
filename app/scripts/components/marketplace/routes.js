// @ngInject
export default function issueRoutes($stateProvider) {
  $stateProvider
    .state('marketplace.list', {
      url: '/marketplace/',
      template: '<product-grid></product-grid>',
    });
}
