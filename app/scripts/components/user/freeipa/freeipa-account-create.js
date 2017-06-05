import template from './freeipa-account-create.html';

const freeipaAccountCreate = {
  template: template,
  bindings: {
    onProfileAdded: '&',
  },
  controller: class FreeIPAAccountCreateController {
    // @ngInject
    constructor(freeipaService, ncUtilsFlash){
      this.freeipaService = freeipaService;
      this.ncUtilsFlash = ncUtilsFlash;
    }
    getTooltip() {
      if(!this.profile || !this.profile.agree_with_policy) {
        return gettext('You must agree with terms of service');
      }
    }
    submitForm() {
      this.parentForm.$setSubmitted();
      if(this.parentForm.$invalid){
        return;
      }
      this.loading = true;
      this.freeipaService.createProfile(this.profile.username, this.profile.agree_with_policy).then(() => {
        this.ncUtilsFlash.success(gettext('A profile has been created'));
        this.onProfileAdded();
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};

export default freeipaAccountCreate;
