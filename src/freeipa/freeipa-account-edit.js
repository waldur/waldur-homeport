import template from './freeipa-account-edit.html';

const freeipaAccountEdit = {
  template: template,
  bindings: {
    profile: '<',
    onProfileRemoved: '&',
  },
  controller: class FreeIPAAccountEditController {
    // @ngInject
    constructor(freeipaService, ncUtilsFlash) {
      this.freeipaService = freeipaService;
      this.ncUtilsFlash = ncUtilsFlash;
    }

    enableProfile() {
      this.loading = true;
      this.freeipaService
        .enableProfile(this.profile.uuid)
        .then(() => {
          this.profile.is_active = true;
          this.ncUtilsFlash.success(gettext('Your FreeIPA has been enabled.'));
        })
        .finally(() => {
          this.loading = false;
        });
    }

    disableProfile() {
      this.loading = true;
      this.freeipaService
        .disableProfile(this.profile.uuid)
        .then(() => {
          this.profile.is_active = false;
          this.ncUtilsFlash.success(
            gettext('Your FreeIPA profile has been disabled.'),
          );
        })
        .finally(() => {
          this.loading = false;
        });
    }

    syncProfile() {
      this.loading = true;
      this.freeipaService
        .syncProfile(this.profile.uuid)
        .then(response => {
          if (response.status === 204) {
            this.ncUtilsFlash.success(
              gettext('Your FreeIPA has been removed in FreeIPA server.'),
            );
            return this.onProfileRemoved();
          } else {
            this.ncUtilsFlash.success(
              gettext('Your FreeIPA has been synced successfully.'),
            );
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
};

export default freeipaAccountEdit;
