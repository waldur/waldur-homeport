import template from './permissions-log-list.html';

const customerPermissionsLogList = {
  template: template,
  controller: customerPermissionsLogListController,
  controllerAs: '$ctrl',
};

// @ngInject
function customerPermissionsLogListController(
  baseControllerListClass, customerPermissionsLogService, currentStateService) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = customerPermissionsLogService;
      this.currentCustomerUuid = currentStateService.getCustomerUuid();
      this._super();
    },
    getFilter: function() {
      return {
        customer_uuid: this.currentCustomerUuid
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default customerPermissionsLogList;
