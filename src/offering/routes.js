// @ngInject
export default function offeringRoutes($stateProvider) {
  $stateProvider

  .state('offeringDetails', {
    url: '/offering/:uuid/',
    template: '<offering-details></offering-details>',
    feature: 'offering',
  });

}
