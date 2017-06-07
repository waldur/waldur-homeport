import template from './freeipa-account-create.html';

const freeipaAccountCreate = {
  template: template,
  bindings: {
    onProfileAdded: '&',
  },
  controller: class FreeIPAAccountCreateController {
    // @ngInject
    constructor(freeipaService, ncUtilsFlash, ENV, usersService){
      this.freeipaService = freeipaService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.usersService = usersService;
      this.prefix = ENV.FREEIPA_USERNAME_PREFIX;
    }

    $onInit() {
      this.loading = true;
      this.usersService.getCurrentUser().then(user => {
        this.profile = {
          username: user.username,
          agree_with_policy: false,
        };
      }).finally(() => this.loading = false);
    }

    getTooltip() {
      if(!this.profile.agree_with_policy) {
        return gettext('You must agree with terms of service.');
      }
    }

    submitForm() {
      this.profileForm.$setSubmitted();
      if(this.profileForm.$invalid){
        return;
      }
      this.submitting = true;
      return this.freeipaService.createProfile(
        this.profile.username,
        this.profile.agree_with_policy
      ).catch(() => {
        this.ncUtilsFlash.success(gettext('Unable to create a FreeIPA profile.'));
      }).then(() => {
        this.ncUtilsFlash.success(gettext('A profile has been created.'));
        this.onProfileAdded();
      }).finally(() => this.submitting = false);
    }
  }
};

export default freeipaAccountCreate;
