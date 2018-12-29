// @ngInject
function validateProviderCreation($q, $state, currentStateService, ENV, usersService, ncUtils) {
  $q.all([
    usersService.getCurrentUser(),
    currentStateService.getCustomer(),
  ]).then(([user, customer]) => {
    if (ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES && !user.is_staff) {
      return $state.go('invalidRoutePage');
    }

    if (customer && ncUtils.isCustomerQuotaReached(customer, 'service')) {
      return $state.go('errorPage.limitQuota');
    }
  });
}

// @ngInject
export default function providerRoutes($stateProvider) {
  $stateProvider
    .state('organization.providers', {
      url: 'providers/?providerUuid&providerType',
      template: '<providers-list></providers-list>',
      data: {
        pageTitle: gettext('Providers')
      }
    })

    .state('organization.createProvider', {
      url: 'createProvider/',
      template: '<provider-create></provider-create>',
      data: {
        pageTitle: gettext('Create provider')
      },
      resolve: {
        validateProviderCreation,
      }
    });
}
