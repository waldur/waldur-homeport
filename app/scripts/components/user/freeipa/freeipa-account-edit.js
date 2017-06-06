import template from './freeipa-account-edit.html';

const freeipaAccountEdit = {
  template: template,
  bindings: {
    profile: '<',
  },
  controller: class FreeIPAAccountEditController {
    // @ngInject
    constructor(freeipaService, ncUtilsFlash, ENV){
      this.freeipaService = freeipaService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.prefix = ENV.freeipaWaldurPrefix;
    }

    $onInit(){
      this.profile.username = this.profile.username.replace(this.prefix, '');
    }

    enableProfile() {
      this.loading = true;
      this.freeipaService.enableProfile(this.profile.uuid).then(() => {
        this.profile.is_active = true;
        this.ncUtilsFlash.success(gettext('Profile has been enabled'));
      }).finally(() => {
        this.loading = false;
      });
    }

    disableProfile() {
      this.loading = true;
      this.freeipaService.disableProfile(this.profile.uuid).then(() => {
        this.profile.is_active = false;
        this.ncUtilsFlash.success(gettext('Profile has been disabled'));
      }).finally(() => {
        this.loading = false;
      });
    }

    syncProfile() {
      this.loading = true;
      this.freeipaService.syncProfile(this.profile.uuid).then(() => {
        this.ncUtilsFlash.success(gettext('Profile has been synced successfully'));
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};

export default freeipaAccountEdit;
