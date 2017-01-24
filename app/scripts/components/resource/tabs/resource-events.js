const resourceEvents = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ResourceEventsController,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

export default resourceEvents;

// @ngInject
function ResourceEventsController(baseEventListController) {
  var controllerScope = this;
  var EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getFilter: function() {
      return {
        scope: controllerScope.resource.url
      };
    }
  });

  controllerScope.__proto__ = new EventController();
}
