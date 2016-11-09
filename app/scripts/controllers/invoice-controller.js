(function() {
  angular.module('ncsaas')
    .controller('InvoiceDetailsController', [
      'baseControllerClass',
      'invoicesService',
      '$state',
      '$window',
      'ncUtils',
      InvoiceDetailsController
    ]);

  function InvoiceDetailsController(
    baseControllerClass,
    invoicesService,
    $state,
    $window,
    ncUtils) {
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
          vm.invoice.openstack_items.map(function(item) {
            item.start = moment(item.start).format('YYYY-MM-DD');

            item.end = moment(item.end).format('YYYY-MM-DD');
            return item;
          });
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
