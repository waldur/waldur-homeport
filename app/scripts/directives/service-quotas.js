'use strict';

(function() {
  angular.module('ncsaas')
    .directive('serviceQuotas', [serviceQuotas]);

  function serviceQuotas() {
    return {
      restrict: 'A',
      scope: {
        service: '='
      },
      controller: 'ServiceQuotasController',
      templateUrl: 'views/directives/service-quotas.html'
    };
  }

  angular.module('ncsaas')
    .controller('ServiceQuotasController', ServiceQuotasController);

  ServiceQuotasController.$inject = [
    '$scope',
    'customersService',
  ];

  function ServiceQuotasController($scope, customersService) {
    angular.extend($scope, {
      init: function() {
        $scope.userCanManageService = false;
        $scope.loading = true;
        customersService.isOwnerOrStaff().then(function(value) {
          $scope.userCanManageService = value;
          $scope.loading = false;
        });
      }
    });
    $scope.init();
  }


  angular.module('ncsaas').filter('quotaName', function() {
    var names = {
      floating_ip_count: 'Floating IP count',
      vcpu: 'vCPU count',
      ram: 'RAM, MiB',
      vm_count: 'Virtual machines count',
      storage: 'Storage, MiB',
      itservice_count: 'IT service count'
    }
    return function(name) {
      if (names[name]) {
        return names[name];
      }
      var name = name.replace(/_/g, ' ');
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  });

})();
