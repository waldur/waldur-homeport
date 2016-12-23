export default function userEvents() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: UserEventsListController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: {
      user: '='
    }
  };
}

// @ngInject
function UserEventsListController(baseEventListController) {
  var controllerScope = this;
  var EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getFilter: function() {
      return {
        scope: controllerScope.user.url,
        feature: 'users'
      };
    }
  });

  controllerScope.__proto__ = new EventController();
}
