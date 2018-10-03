import template from './appstore-field-select-ssh-key.html';

class AppstoreFieldSelectSshKeyController {
  // @ngInject
  constructor(ncUtilsFlash, keysService, usersService) {
    this.ncUtilsFlash = ncUtilsFlash;
    this.keysService = keysService;
    this.usersService = usersService;
  }

  $onInit() {
    this.loadKeys();
  }

  loadKeys() {
    this.loading = true;
    return this.usersService.getCurrentUser().then(user => {
      return this.keysService.getAll({
        user_uuid: user.uuid,
        is_shared: false
      }).then(keys => {
        this.choices = keys.map(key => ({
          display_name: key.name,
          value: `SSH public key: ${key.public_key}`
        }));
        this.loading = false;
        this.loaded = true;
      }).catch(response => {
        this.ncUtilsFlash.errorFromResponse(response, gettext('Unable to get list of SSH public keys.'));
        this.loading = false;
        this.loaded = false;
      });
    });
  }
}

const appstoreFieldSelectSshKey = {
  template,
  bindings: {
    field: '<',
    model: '<'
  },
  controller: AppstoreFieldSelectSshKeyController,
};

export default appstoreFieldSelectSshKey;
