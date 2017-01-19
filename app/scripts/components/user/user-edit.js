import template from './user-edit.html';
import './user-edit.scss';

export const userEdit = {
  template,
  bindings: {
    user: '<',
    onRemove: '&',
    onSave: '&',
    errors: '<',
    initial: '<',
  },
  controller: class UserEditController {
    constructor($q, usersService) {
      // @ngInject
      this.$q = $q;
      usersService.getCurrentUser().then(user => {
        this.currentUser = user;
      });
    }

    $onInit() {
      this.user = angular.copy(this.user);
    }

    save() {
      if (this.UserForm.$invalid) {
        return this.$q.reject();
      }
      return this.onSave({
        $event: {
          user: this.user
        }
      });
    }
  }
};
