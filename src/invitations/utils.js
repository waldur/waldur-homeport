export class invitationUtilsService {
  // @ngInject
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
    ENV,
  ) {
    this.invitationService = invitationService;
    this.usersService = usersService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$q = $q;
    this.$auth = $auth;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$uibModal = $uibModal;
    this.validateInvitationEmail =
      ENV.plugins.WALDUR_CORE.VALIDATE_INVITATION_EMAIL;
  }

  init() {
    /*
     Display invitation confirm dialog on registration.

     Triggered only if user has registered, which is the case if:
     - $stateChangeSuccess called;
     - user is logged in;
     - invitation token is set in invitation service;
     - user has filled all mandatory fields;
     */
    this.$rootScope.$on('$stateChangeSuccess', (_, toState) => {
      if (
        this.$auth.isAuthenticated() &&
        toState.name !== 'marketplace-public-offering.details'
      ) {
        this.usersService.getCurrentUser().then(user => {
          const token = this.invitationService.getInvitationToken();
          if (token && !this.usersService.mandatoryFieldsMissing(user)) {
            this.confirmInvitation(token)
              .then(replaceEmail => {
                this.acceptInvitation(token, replaceEmail);
              })
              .catch(() => {
                this.invitationService.clearInvitationToken();
                this.ncUtilsFlash.error(
                  gettext('Invitation could not be accepted'),
                );
              });
          }
        });
      }
    });
  }

  checkAndAccept(token) {
    /*
     Call confirm token dialog, accept it and redirect user to profile.
     If user is not logged in - set token and redirect user to registration.
     If user is logged in and token is not valid - clear the token and redirect to user profile with the error message.
     */
    if (this.$auth.isAuthenticated()) {
      return this.confirmInvitation(token)
        .then(replaceEmail => {
          this.acceptInvitation(token, replaceEmail).then(() => {
            this.$state.go('profile.details');
          });
        })
        .catch(() => {
          this.invitationService.clearInvitationToken();
          this.ncUtilsFlash.error(gettext('Invitation is not valid anymore.'));
          this.$state.go('profile.details');
        });
    } else {
      this.invitationService.setInvitationToken(token);
      this.$state.go('register');
    }
  }

  acceptInvitation(token, replaceEmail) {
    return this.invitationService
      .accept(token, replaceEmail)
      .then(() => {
        this.ncUtilsFlash.success(gettext('Your invitation was accepted.'));
        this.invitationService.clearInvitationToken();
        this.$rootScope.$broadcast('refreshCustomerList', {
          updateSignal: true,
        });
      })
      .catch(this.showError.bind(this));
  }

  confirmInvitation(token) {
    const dialog = this.$uibModal.open({
      component: 'invitationConfirmDialog',
      resolve: {
        token: () => token,
        acceptNewEmail: () => true,
        rejectNewEmail: () => false,
      },
    });
    const deferred = this.$q.defer();
    dialog.result.then(result => deferred.resolve(result));
    dialog.closed.then(() => deferred.reject());
    return deferred.promise;
  }

  showError(response) {
    if (response.status === 404) {
      this.ncUtilsFlash.error(gettext('Invitation is not found.'));
    } else if (response.status === 400) {
      this.invitationService.clearInvitationToken();
      this.ncUtilsFlash.error(gettext('Invitation is not valid.'));
    } else if (response.status === 500) {
      this.ncUtilsFlash.error(
        gettext(
          'Internal server error occurred. Please try again or contact support.',
        ),
      );
    }
  }
}

// @ngInject
export function attachInvitationUtils(invitationUtilsService) {
  invitationUtilsService.init();
}
