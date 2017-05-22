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
    this.invitationCheckInterval = ENV.invitationCheckInterval;
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
    /*
      - Poll invitation check endpoint if server is not available.
      - If invitation is valid - accept token and redirect user either to profile or registration page.
      - redirect user to Not Found page.
    */

    this.invitationService.check(token).then(() => {
      this.accept(token);
    }).catch(response => {
      if (response.status === -1 || response.status >= 500) {
        this.ncUtilsFlash.clear();
        this.$timeout(this.checkAndAccept.bind(this), this.invitationCheckInterval, true, token);
      } else {
        this.$state.go('errorPage.notFound');
      }
    });
  }
  accept(token) {
    if (this.$auth.isAuthenticated()) {
      this.acceptInvitation(token).then(() => {
        this.$state.go('profile.details');
      });
    } else {
      this.invitationService.setInvitationToken(token);
      this.$state.go('register');
    }
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
