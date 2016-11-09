(function() {
  angular.module('ncsaas')
    .controller('InvoiceDetailsController', [
      'baseControllerClass',
      'invoicesService',
      'authService',
      '$state',
      '$window',
      InvoiceDetailsController
    ]);

  function InvoiceDetailsController(
    baseControllerClass,
    invoicesService,
    authService,
    $state,
    $window) {
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
          invoice.downloadLink = authService.getLink(invoice.pdf);
          vm.invoice = invoice;
          vm.loading = false;
        });

      },
      printLink: function() {
        $window.open(this.invoice.downloadLink);
      }
    });

    controllerScope.__proto__ = new InvoiceDetailsController();
  }

})();
