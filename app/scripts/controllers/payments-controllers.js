'use strict';

(function() {
    angular.module('ncsaas')
    .controller('PaymentMockController',
      ['ordersService', '$stateParams', '$state', 'baseControllerClass', PaymentMockController]);

  function PaymentMockController(
    ordersService, $stateParams, $state, baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({

      init: function() {
        this._super();
        this.executeOrder();
      },
      executeOrder: function() {
        ordersService.$get($stateParams.uuid).then(
          function(order) {
            ordersService.executeOrder($stateParams.uuid).then(function() {
              // TODO refactor this function to use named customer_uuid field
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
    });

    controllerScope.__proto__ = new Controller();
  }
})();
