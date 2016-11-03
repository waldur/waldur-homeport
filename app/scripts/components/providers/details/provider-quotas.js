import template from './provider-quotas.html';
import './provider-quotas.scss';

export default function providerQuotas() {
  return {
    restrict: 'E',
    scope: {
      service: '=provider'
    },
    controller: ProviderQuotasController,
    template: template
  };
}

// @ngInject
function ProviderQuotasController($scope, customersService) {
  $scope.userCanManageService = false;
  $scope.loading = true;
  customersService.isOwnerOrStaff().then(function(value) {
    $scope.userCanManageService = value;
    $scope.loading = false;
  });
}
