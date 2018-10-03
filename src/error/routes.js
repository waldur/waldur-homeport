// @ngInject
export default function errorRoutes($stateProvider) {
  $stateProvider
    .state('errorPage', {
      templateUrl: 'views/partials/base.html',
      abstract: true,
      data: {
        bodyClass: 'old'
      }
    })

    .state('errorPage.notFound', {
      template: '<invalid-object-page></invalid-object-page>',
      data: {
        pageTitle: gettext('Page is not found.')
      }
    })

    .state('errorPage.otherwise', {
      url: '*path',
      template: '<invalid-route-page></invalid-route-page-page>',
      data: {
        pageTitle: gettext('Object is not found.')
      }
    })

    .state('errorPage.limitQuota', {
      template: '<invalid-quota-page></invalid-quota-page>',
      data: {
        pageTitle: gettext('Quota has been reached.')
      }
    });
}
