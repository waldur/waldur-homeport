import template from './freeipa-account.html';

const freeipaAccount = {
  template: template,
  controller: class FreeIPAAccountController {
    // @ngInject
    constructor(freeipaService, usersService) {
      this.freeipaService = freeipaService;
      this.usersService = usersService;
    }

    $onInit() {
      this.userHasProfile = false;
      this.refreshProfile();
    }

    refreshProfile() {
      this.loading = true;
      this.usersService.getCurrentUser().then(user => {
        this.freeipaService.getProfile(user).then(response => {
          this.userHasProfile = response.data.length === 1;
          if (this.userHasProfile) {
            this.profile = response.data[0];
          }
          this.loading = false;
        });
      });
    }
  },
};

export default freeipaAccount;
