(function() {
  angular.module('ncsaas')
    .controller('InvoiceDetailsController', [
      'baseControllerClass',
      'invoicesService',
      '$state',
      '$window',
      '$filter',
      InvoiceDetailsController
    ]);

  function InvoiceDetailsController(
    baseControllerClass,
    invoicesService,
    $state,
    $window,
    $filter) {
    var controllerScope = this;
    var InvoiceDetailsController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        this.loading = true;
        this.invoice = {};
        this.loadInitial();
      },
      loadInitial: function() {
        var vm = this;
        invoicesService.$get($state.params.invoiceUUID).then(function(invoice) {
          vm.invoice = invoice;
          vm.loading = false;
        });
      },
      printLink: function() {
        $window.print();
      }
    });

    controllerScope.__proto__ = new InvoiceDetailsController();
  }

})();
