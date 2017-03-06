export default function customerEvents() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: CustomerEventsController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: {
      customer: '='
    }
  };
}

// @ngInject
function CustomerEventsController(baseEventListController) {
  var controllerScope = this;
  var EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();

      this.searchFilters = [
        {
          name: 'feature',
          title: gettext('Organization events'),
          value: 'customers'
        },
        {
          name: 'feature',
          title: gettext('Project events'),
          value: 'projects'
        },
        {
          name: 'feature',
          title: gettext('Resource events'),
          value: 'resources'
        }
      ];

      this.defaultFilter = this.searchFilters[0];
    },
    getFilter: function() {
      let filter = {
        scope: controllerScope.customer.url
      };
      if (this.chosenFilters.length === 0) {
        filter.feature = ['customers', 'projects', 'resources'];
      }
      return filter;
    }
  });

  controllerScope.__proto__ = new EventController();
}
