// @ngInject
export default function errorRoutes($stateProvider) {
  $stateProvider
    .state('errorPage', {
      url: '/error/',
      templateUrl: 'views/partials/base.html',
      abstract: true,
      data: {
        bodyClass: 'old'
      }
    })

    .state('errorPage.notFound', {
      url: '404/',
      template: '<error404></error404>',
      data: {
        pageTitle: gettext('Page not found')
      }
    })

    .state('errorPage.limitQuota', {
      url: '403/',
      template: '<error403></error403>',
      data: {
        pageTitle: gettext('Quota has been reached.')
      }
    });
}
