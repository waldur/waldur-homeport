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
    this.emailUpdateActive = ENV.UPDATE_EMAIL_WITH_INVITATION_ACTIVE;
  }

  init() {
    // After successful login/sign up accept invitation and display message to user.
    this.$rootScope.$on('authService:signin', () => {
      var token = this.invitationService.getInvitationToken();
      if (token) {
        this.acceptInvitation(token);
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

    return this.invitationService.check(token).then(() => {
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
  }

  acceptInvitation(token) {
    this.loadUserInvitation(token).then(context => {
      let user = context.user;
      let invitation = context.invitation;
      if (!this.emailUpdateActive && user.email && user.email === invitation.email) {
        this.invitationService.clearInvitationToken().then(() => {
          this.ncUtilsFlash.error(gettext('Invitation is not valid.'));
          this.$state.go('errorPage.notFound');
        });
      }

      return this.shallChangeEmail(invitation).then(replace_email => {
        return this.invitationService.accept(token, replace_email).then(() => {
          this.ncUtilsFlash.success(gettext('Your invitation was accepted.'));
          this.invitationService.clearInvitationToken();
          this.$rootScope.$broadcast('refreshCustomerList', {updateSignal: true});
        }).catch(this.showError.bind(this));
      });
    });
  }

  shallChangeEmail(user, invitation) {
    if (!user.email || user.email === invitation.email) {
      return true;
    }

    const dialog = this.$uibModal.open({
      component: 'invitationConfirmDialog',
      resolve: {
        user: () => user,
        invitation: () => invitation,
      }
    });
    const deferred = this.$q.defer();
    dialog.result.then(() => deferred.resolve(true));
    dialog.closed.then(() => deferred.resolve(false));
    return deferred.promise;
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
