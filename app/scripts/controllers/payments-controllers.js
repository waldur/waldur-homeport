'use strict';

(function() {
    angular.module('ncsaas')
    .controller('PaymentMockController', ['ordersService', '$stateParams', '$state', PaymentMockController]);

  function PaymentMockController(ordersService, $stateParams, $state) {
    var vm = this;

    function executeOrder() {
      ordersService.$get($stateParams.uuid).then(
        function(order) {
          ordersService.executeOrder($stateParams.uuid).then(function() {
            var array = order.customer.split('/').filter(function(el) {
            return el.length !== 0;
            }),
            customerUUID = array[4];
            $state.go('customers.plans', {uuid:customerUUID});
          }, function(error) {
            alert(error.data.detail);
          });
        },
        function(error) {
          alert(error.data.detail);
        }
      );
    }

    executeOrder();

  }
})();
