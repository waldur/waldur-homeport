const customerAlerts = {
  controller: CustomerAlertsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default customerAlerts;

// @ngInject
function CustomerAlertsListController(BaseAlertsListController, currentStateService) {
  let controllerScope = this;
  let controllerClass = BaseAlertsListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getList: function(filter) {
      let vm = this;
      let fn = this._super.bind(vm);
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
