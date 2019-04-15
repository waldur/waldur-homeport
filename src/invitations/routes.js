// @ngInject
export default function authRoutes($stateProvider) {
  $stateProvider
    .state('invitation', {
      url: '/invitation/:uuid/',
      data: {
        bodyClass: 'old'
      },
      template: '<invitation-accept></invitation-accept>'
    })

    .state('invitation-approve', {
      url: '/invitation_approve/:token/',
      template: '<invitation-approve></invitation-approve>',
      data: {
        bodyClass: 'old',
      }
    })

    .state('invitation-reject', {
      url: '/invitation_reject/:token/',
      template: '<invitation-reject></invitation-reject>',
      data: {
        bodyClass: 'old',
      }
    });
}
