// @ngInject
export class invitationUtilsService {
  constructor(invitationService,
              usersService,
              ncUtilsFlash,
              $q,
              $auth,
              $state,
              $rootScope,
              $timeout,
              $uibModal) {
    this.invitationService = invitationService;
    this.usersService = usersService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$q = $q;
    this.$auth = $auth;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$uibModal = $uibModal;
  }

  init() {
    // After successful login/sign up accept invitation and display message to user.
    this.$rootScope.$on('$stateChangeSuccess', () => {
      if (this.$auth.isAuthenticated()) {
        this.usersService.getCurrentUser().then(user => {
          let token = this.invitationService.getInvitationToken();
          if (token && !this.usersService.mandatoryFieldsMissing(user)) {
            this.validateInvitationToken(token).then(() => {
              this.acceptInvitation(token);
            }).catch(() => {
              this.ncUtilsFlash.error(gettext('Invitation could not be accepted'));
            });
          }
        });
      }
    });
  }

  checkAndAccept(token) {
    /* 1) If invitation token is invalid then display 404.

     2) If invitation token is valid and user is already logged in
     then accept invitation and display message to user.

     3) If invitation is valid and user is anonymous then
     redirect him to registration page.
     */

    return this.validateInvitationToken(token).then(() => {
      this.invitationService.check(token).then(() => {
        if (this.$auth.isAuthenticated()) {
          this.acceptInvitation(token).then(() => {
            this.$state.go('profile.details');
          });
        } else {
          this.invitationService.setInvitationToken(token);
          this.$state.go('register');
        }
      }).catch(response => {
        this.showError(response);
        if (this.$auth.isAuthenticated()) {
          this.$state.go('profile.details');
        } else {
          this.$state.go('login');
        }
      });
    }).catch(() => {
      this.ncUtilsFlash.error(gettext('Invitation is not valid anymore.'));
      this.$state.go('errorPage.notFound');
    });
  }

  acceptInvitation(token) {
    return this.shallChangeEmail(token).then(replace_email => {
      return this.invitationService.accept(token, replace_email).then(() => {
        this.ncUtilsFlash.success(gettext('Your invitation was accepted.'));
        this.invitationService.clearInvitationToken();
        this.$rootScope.$broadcast('refreshCustomerList', {updateSignal: true});
      }).catch(this.showError.bind(this));
    });
  }

  validateInvitationToken(token) {
    const dialog = this.$uibModal.open({
      component: 'invitationCheckDialog',
      resolve: {
        token: () => token,
      }
    });
    const deferred = this.$q.defer();
    dialog.result.then(() => deferred.resolve());
    dialog.closed.then(() => deferred.reject());
    return deferred.promise;
  }

  shallChangeEmail(token) {
    return this.loadUserInvitation(token).then(context => {
      if (!context.user.email || context.user.email === context.invitation.email) {
        return true;
      }

      const dialog = this.$uibModal.open({
        component: 'invitationConfirmDialog',
        resolve: {
          user: () => context.user,
          invitation: () => context.invitation,
        }
      });
      const deferred = this.$q.defer();
      dialog.result.then(() => deferred.resolve(true));
      dialog.closed.then(() => deferred.resolve(false));
      return deferred.promise;
    });
  }

  loadUserInvitation(token) {
    return this.usersService.getCurrentUser().then(user => {
      return this.invitationService.check(token).then(response => {
        return { invitation: response.data, user };
      });
    });
  }

  showError(response) {
    if (response.status === 404) {
      this.ncUtilsFlash.error(gettext('Invitation is not found.'));
    } else if (response.status === 400) {
      this.invitationService.clearInvitationToken();
      this.ncUtilsFlash.error(gettext('Invitation is not valid.'));
    } else if (response.status === 500) {
      this.ncUtilsFlash.error(gettext('Internal server error occurred. Please try again or contact support.'));
    }
  }
}

// @ngInject
export function attachInvitationUtils(invitationUtilsService) {
  invitationUtilsService.init();
}
