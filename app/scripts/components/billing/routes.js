// @ngInject
export default function billingRoutes($stateProvider) {
  $stateProvider
    .state('organization.billing', {
      url: 'billing/',
      template: '<ui-view/>',
      abstract: true
    })

    .state('organization.billing.tabs', {
      url: '',
      template: '<billing-tabs/>'
    })

    .state('billingDetails', {
      url: '/billing/:uuid/',
      template: '<billing-details/>'
    });
}
