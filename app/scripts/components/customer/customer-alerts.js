const customerAlerts = {
  controller: CustomerAlertsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default customerAlerts;

// @ngInject
function CustomerAlertsListController(BaseAlertsListController, currentStateService) {
  var controllerScope = this;
  var controllerClass = BaseAlertsListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getList: function(filter) {
      var vm = this;
      var fn = this._super.bind(vm);
      filter = filter || {};
      return currentStateService.getCustomer().then(function(customer) {
        vm.service.defaultFilter.aggregate = 'customer';
        vm.service.defaultFilter.uuid = customer.uuid;
        return fn(filter);
      });
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
