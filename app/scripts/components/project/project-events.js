export default function projectEvents() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: ProjectEventsController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: {
      project: '='
    }
  };
}

// @ngInject
function ProjectEventsController(baseEventListController) {
  var controllerScope = this;
  var EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();

      this.searchFilters = [
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
        scope: controllerScope.project.url
      };
      if (this.chosenFilters.length === 0) {
        filter.feature = ['projects', 'resources'];
      }
      return filter;
    }
  });

  controllerScope.__proto__ = new EventController();
}
