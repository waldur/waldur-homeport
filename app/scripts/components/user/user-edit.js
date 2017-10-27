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
    // @ngInject
    constructor($q, usersService, $filter, ENV) {
      this.$q = $q;
      this.$filter = $filter;
      usersService.getCurrentUser().then(user => {
        this.currentUser = user;
      });
      this.userMandatoryFields = ENV.userMandatoryFields;
      this.userRegistrationHiddenFields = ENV.userRegistrationHiddenFields;
      this.userTokenLifetimeOptions = [
        { name: '10 min', value: 600 },
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
      if (this.initial) {
        this.user.agree_with_policy = true;
      }

      return this.onSave({
        $event: {
          user: this.user
        }
      });
    }

    isRequired(field) {
      return this.userMandatoryFields.indexOf(field) !== -1;
    }

    isVisible(field) {
      if (!this.initial) {
        return true;
      }

      return this.userRegistrationHiddenFields.indexOf(field) === -1;
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
