// @ngInject
export default function UserEventsController(
  baseEventListController, usersService) {
  var controllerScope = this;
  var ControllerListClass = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getFilter: function() {
      return {
        scope: usersService.currentUser.url
      };
    }
  });

  controllerScope.__proto__ = new ControllerListClass();
}
