const offeringEvents = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: offeringEventsController,
  controllerAs: 'ListController',
  bindings: {
    offering: '<'
  }
};

export default offeringEvents;

// @ngInject
function offeringEventsController(baseEventListController) {
  var controllerScope = this;
  var EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.tableOptions.disableButtons = true;
    },
    getFilter: function() {
      return {
        scope: controllerScope.offering.issue
      };
    }
  });

  controllerScope.__proto__ = new EventController();
}
