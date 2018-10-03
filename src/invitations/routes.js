// @ngInject
export default function authRoutes($stateProvider) {
  $stateProvider
    .state('invitation', {
      url: '/invitation/:uuid/',
      data: {
        bodyClass: 'old'
      },
      template: '<invitation-accept></invitation-accept>'
    });
}
