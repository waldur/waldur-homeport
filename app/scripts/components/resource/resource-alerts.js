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
  var controllerScope = this;
  var controllerClass = BaseAlertsListController.extend({
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
