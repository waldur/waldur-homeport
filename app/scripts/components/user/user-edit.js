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
    constructor($q, usersService, $filter) {
      // @ngInject
      this.$q = $q;
      this.$filter = $filter;
      usersService.getCurrentUser().then(user => {
        this.currentUser = user;
      });

      this.userTokenLifetimeOptions = [
        { name: '30 min', value: 1800 },
        { name: '1 h', value: 3600 },
        { name: '2 h', value: 7200 },
        { name: '12 h', value: 43200 },
        { name: 'token will not timeout', value: null }
      ];
    }

    $onInit() {
      this.user = angular.copy(this.user);
      let filteredToken = this.$filter('formatLifetime')(this.user.token_lifetime);
      let filteredTokenOption = { name: filteredToken, value: this.user.token_lifetime };
      this.lifetimeOptions = this.mergeLifeTimeOptions(this.userTokenLifetimeOptions, filteredTokenOption);
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

    mergeLifeTimeOptions(options, option) {
      var exists = false,
        resultOptions = options;

      resultOptions.forEach(item => {
        if (item.name === option.name) {
          exists = true;
        }
      });
      if (!exists) {
        resultOptions.push(option);
      }
      return resultOptions;
    }
  }
};
