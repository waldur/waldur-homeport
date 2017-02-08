// @ngInject
export default function helpRoutes($stateProvider) {
  $stateProvider
    .state('help', {
      url: '/help/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
      data: {
        pageTitle: 'Help',
        bodyClass: 'old',
        auth: true,
        feature: 'help',
      }
    })

    .state('help.list', {
      url: '',
      template: '<help-list/>',
    })

    .state('help.details', {
      url: ':name/',
      template: '<help-details/>',
    });
}
