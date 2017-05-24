// @ngInject
export class invitationUtilsService {
  constructor(
    invitationService,
    usersService,
    ncUtilsFlash,
    $q,
    $auth,
    $state,
    $rootScope,
    $timeout,
    $uibModal,
    ENV) {
    this.invitationService = invitationService;
    this.usersService = usersService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$q = $q;
    this.$auth = $auth;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$uibModal = $uibModal;
    this.validateInvitationEmail = ENV.VALIDATE_INVITATION_EMAIL;
  }

  init() {
    // After successful login/sign up accept invitation and display message to user.
    this.$rootScope.$on('$stateChangeSuccess', () => {
      if (this.$auth.isAuthenticated()) {
        this.usersService.getCurrentUser().then(user => {
          let token = this.invitationService.getInvitationToken();
          if (token && !this.usersService.mandatoryFieldsMissing(user)) {
            this.confirmInvitation(token).then(replaceEmail => {
              this.acceptInvitation(token, replaceEmail);
            }).catch(() => {
              this.invitationService.clearInvitationToken();
              this.ncUtilsFlash.error(gettext('Invitation could not be accepted'));
            });
          }
        });
      }
    });
  }

  checkAndAccept(token) {
    if (this.$auth.isAuthenticated()) {
      return this.confirmInvitation(token).then(replaceEmail => {
        this.acceptInvitation(token, replaceEmail).then(() => {
          this.$state.go('profile.details');
        });
      }).catch(() => {
        this.invitationService.clearInvitationToken();
        this.ncUtilsFlash.error(gettext('Invitation is not valid anymore.'));
        if (this.$auth.isAuthenticated()) {
          this.$state.go('profile.details');
        } else {
          this.$state.go('login');
        }
      });
    } else {
      this.invitationService.setInvitationToken(token);
      this.$state.go('register');
    }
  }

  acceptInvitation(token, replaceEmail) {
    return this.invitationService.accept(token, replaceEmail).then(() => {
      this.ncUtilsFlash.success(gettext('Your invitation was accepted.'));
      this.invitationService.clearInvitationToken();
      this.$rootScope.$broadcast('refreshCustomerList', {updateSignal: true});
    }).catch(this.showError.bind(this));
  }

  confirmInvitation(token) {
    const dialog = this.$uibModal.open({
      component: 'invitationConfirmDialog',
      resolve: {
        token: () => token,
        acceptNewEmail: () => true,
        rejectNewEmail: () => false,
      }
    });
    const deferred = this.$q.defer();
    dialog.result.then(result => deferred.resolve(result));
    dialog.closed.then(() => deferred.resolve());
    return deferred.promise;
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
