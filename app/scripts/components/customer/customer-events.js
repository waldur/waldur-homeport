const customerEvents = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: CustomerEventsController,
  controllerAs: 'ListController',
  bindings: {
    customer: '<'
  }
};

export default customerEvents;

// @ngInject
function CustomerEventsController(baseEventListController) {
  var controllerScope = this;
  var EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getUserFilter: function() {
      return {
        name: 'feature',
        choices: [
          {
            title: gettext('Organization events'),
            value: 'customers',
            chosen: true
          },
          {
            title: gettext('Project events'),
            value: 'projects'
          },
          {
            title: gettext('Resource events'),
            value: 'resources'
          }
        ]
      };
    },
    getFilter: function() {
      let filter = {
        scope: controllerScope.customer.url
      };
      if (!this.hasChosenUserFilter()) {
        filter.feature = ['customers', 'projects', 'resources'];
      }
      return filter;
    }
  });

  controllerScope.__proto__ = new EventController();
}
