const customerPermissionsLogList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: CustomerPermissionsLogListController,
  controllerAs: 'ListController'
};

// @ngInject
function CustomerPermissionsLogListController(
  baseEventListController, currentStateService) {
  let controllerScope = this;
  let EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      const fn = this._super.bind(this);
      currentStateService.getCustomer().then(customer => {
        this.customer = customer;
        fn();
      });
    },
    getFilter: function() {
      return {
        scope: this.customer.url,
        event_type: [
          'role_granted',
          'role_revoked',
          'role_updated',
        ]
      };
    }
  });

  controllerScope.__proto__ = new EventController();
}

export default customerPermissionsLogList;
