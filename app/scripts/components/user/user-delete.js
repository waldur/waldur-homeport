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
function UserDeleteController(baseControllerClass, usersService, $q, $state) {
  var controllerScope = this;
  var DeleteController = baseControllerClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.getUser();
    },
    saveUser: function() {
      var vm = this;
      var i;
      var requiredFields = {
        email: 'Email is required',
        full_name: 'Full name is required'
      };
      vm.user.errors = {};
      for (i in requiredFields) {
        if (requiredFields.hasOwnProperty(i) && !vm.user[i]) {
          vm.user.errors[i] = requiredFields[i];
        }
      }
      if (Object.keys(vm.user.errors).length !== 0) {
        return $q.reject();
      }
      return vm.user.$update(function() {
        usersService.currentUser = null;
      }, function(response) {
        vm.user.errors = response.data;
      });
    },
    getUser: function() {
      var vm = this;
      usersService.getCurrentUser().then(function(response) {
        vm.user = response;
      });
    },
    removeUser: function () {
      $state.go('support.create', {type: 'remove_user'});
    }
  });

  controllerScope.__proto__ = new DeleteController();
}
