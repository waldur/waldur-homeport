import template from './user-popover.html';

export const userPopover = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class UserPopoverController {
    // @ngInject
    constructor(usersService) {
      this.usersService = usersService;
    }

    $onInit() {
      this.loadUser();
    }

    loadUser() {
      if (this.resolve.user_uuid) {
        this.loading = true;
        this.usersService.$get(this.resolve.user_uuid).then(user => {
          this.user = user;
        }).finally(() => {
          this.loading = false;
        });
      } else {
        this.loading = false;
        this.user = this.resolve.user;
      }
    }
  }
};
