const resourceAlerts = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ResourceAlertsListController,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

export default resourceAlerts;

// @ngInject
function ResourceAlertsListController(BaseAlertsListController) {
  let controllerScope = this;
  let controllerClass = BaseAlertsListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },

    getFilter: function() {
      return {
        scope: controllerScope.resource.url,
        opened: true,
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
