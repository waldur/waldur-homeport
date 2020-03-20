// @ngInject
export default function rancherRoutes($stateProvider) {
  $stateProvider
    .state('rancher-catalog-details', {
      url: 'rancher-catalog-details/:clusterUuid/:catalogUuid/',
      template:
        '<rancher-catalog-template-list></rancher-catalog-template-list>',
      parent: 'project',
    })
    .state('rancher-template-details', {
      url: 'rancher-template-details/:clusterUuid/:templateUuid/',
      template: '<rancher-template-details></rancher-template-details>',
      parent: 'project',
    });
}
