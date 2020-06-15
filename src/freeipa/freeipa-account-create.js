import { UsersService } from '@waldur/user/UsersService';

import template from './freeipa-account-create.html';
import { FreeIPAService } from './FreeIPAService';

// These limitations are imposed by underlying operating system
const MAXIMUM_USERNAME_LENGTH = 32;
const USERNAME_PATTERN = '^[a-zA-Z0-9_.][a-zA-Z0-9_.-]*[a-zA-Z0-9_.$-]?$';

const freeipaAccountCreate = {
  template: template,
  bindings: {
    onProfileAdded: '&',
  },
  controller: class FreeIPAAccountCreateController {
    // @ngInject
    constructor(ncUtilsFlash, ENV, $scope) {
      this.ncUtilsFlash = ncUtilsFlash;
      this.prefix = ENV.FREEIPA_USERNAME_PREFIX;
      this.$scope = $scope;
    }

    $onInit() {
      this.maxUsernameLength = MAXIMUM_USERNAME_LENGTH - this.prefix.length;
      this.usernamePattern = USERNAME_PATTERN;
      this.loading = true;
      UsersService.getCurrentUser()
        .then(user => {
          this.profile = {
            username: user.username,
            agree_with_policy: false,
          };
        })
        .finally(() => (this.loading = false));
    }

    getTooltip() {
      if (!this.profile.agree_with_policy) {
        return gettext('You must agree with terms of service.');
      }
    }

    submitForm() {
      if (this.profileForm.$invalid) {
        return;
      }
      this.submitting = true;
      return FreeIPAService.createProfile(
        this.profile.username,
        this.profile.agree_with_policy,
      )
        .then(() => {
          this.ncUtilsFlash.success(gettext('A profile has been created.'));
          this.onProfileAdded();
        })
        .catch(response => {
          if (response.data && response.data.username) {
            return this.ncUtilsFlash.error(response.data.username);
          }
          this.ncUtilsFlash.error(
            gettext('Unable to create a FreeIPA profile.'),
          );
        })
        .finally(() => (this.submitting = false));
    }
  },
};

export default freeipaAccountCreate;
