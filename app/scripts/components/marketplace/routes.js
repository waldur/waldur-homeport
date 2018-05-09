// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('marketplace-list', {
      url: 'marketplace/',
      template: '<marketplace-landing></marketplace-landing>',
      parent: 'project',
      data: {
        hideHeader: true,
      }
    });
}
