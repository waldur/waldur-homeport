import template from './user-delete.html';

export default function userDelete() {
  return {
    restrict: 'E',
    template: template,
    controller: UserDeleteController,
    controllerAs: 'UserDelete',
  };
}

// @ngInject
function UserDeleteController(baseControllerClass, $state) {
  var controllerScope = this;
  var DeleteController = baseControllerClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    removeUser: function () {
      $state.go('support.create', {type: 'remove_user'});
    }
  });

  controllerScope.__proto__ = new DeleteController();
}
