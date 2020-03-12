// @ngInject
export default function rancherRoutes($stateProvider) {
  $stateProvider
    .state('rancher-catalog-details', {
      url: '/rancher-catalog-details/:uuid/',
      template:
        '<rancher-catalog-template-list></rancher-catalog-template-list>',
    })
    .state('rancher-template-details', {
      url: '/rancher-template-details/:uuid/',
      template: '<rancher-template-details></rancher-template-details>',
    });
}
