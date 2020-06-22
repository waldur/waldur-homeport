import template from './freeipa-account-edit.html';
import { FreeIPAService } from './FreeIPAService';

const freeipaAccountEdit = {
  template: template,
  bindings: {
    profile: '<',
    onProfileRemoved: '&',
  },
  controller: class FreeIPAAccountEditController {
    // @ngInject
    constructor(ncUtilsFlash) {
      this.ncUtilsFlash = ncUtilsFlash;
    }

    enableProfile() {
      this.loading = true;
      FreeIPAService.enableProfile(this.profile.uuid)
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
      FreeIPAService.disableProfile(this.profile.uuid)
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
      FreeIPAService.syncProfile(this.profile.uuid)
        .then((response) => {
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
