import template from './user-edit.html';
import style from './user-edit.scss';

export default function userEdit() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      user: '=user',
      onRemove: '&',
      onSave: '&',
      errors: '=',
      initial: '='
    },
    controller: UserEditController,
    controllerAs: '$ctrl'
  };
}

class UserEditController {
  constructor($q) {
    this.$q = $q;
  }
  save() {
    if (this.UserForm.$invalid) {
      return this.$q.reject();
    }
    return this.onSave();
  }
}
