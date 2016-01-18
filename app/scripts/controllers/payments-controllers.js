'use strict';

(function() {
  angular.module('ncsaas')
  .controller('PaymentApproveController',
    ['ncUtils',
     'ncUtilsFlash',
     'paymentsService',
     '$state',
     '$rootScope',
     'currentStateService',
     'baseControllerClass',
     PaymentApproveController]);

  function PaymentApproveController(
    ncUtils,
    ncUtilsFlash,
    paymentsService,
    $state,
    $rootScope,
    currentStateService,
    baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this._super();
        this.approvePayment();
      },
      approvePayment: function() {
        var qs = ncUtils.parseQueryString(ncUtils.getQueryString());
        if (!qs.paymentId || !qs.PayerID) {
          ncUtilsFlash.error('Invalid URL. Unable to parse payment details.');
          return;
        }
        paymentsService.approve({
          payment_id: qs.paymentId,
          payer_id: qs.PayerID
        }).then(function(response) {
          ncUtilsFlash.success('Payment has been processed successfully.');
          currentStateService.reloadCurrentCustomer(function() {
            $rootScope.$broadcast('customerBalance:refresh');
          });
          $state.go('home.home', {});
        });
      },
    });

    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
  .controller('PaymentCancelController',
    ['ncUtils',
     'ncUtilsFlash',
     'paymentsService',
     '$state',
     'baseControllerClass',
     PaymentCancelController]);

  function PaymentCancelController(
    ncUtils,
    ncUtilsFlash,
    paymentsService,
    $state,
    baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this._super();
        this.cancelPayment();
      },
      cancelPayment: function() {
        var qs = ncUtils.parseQueryString(ncUtils.getQueryString());
        if (!qs.token) {
          ncUtilsFlash.error('Invalid URL. Unable to parse payment details.');
          return;
        }
        paymentsService.cancel({token: qs.token}).then(function(response) {
          ncUtilsFlash.success('Payment has been processed successfully.');
          $state.go('home.home', {});
        });
      },
    });

    controllerScope.__proto__ = new Controller();
  }

})();
