import template from './auth-invitation.html';

export default function authInvitation() {
  return {
    restrict: 'E',
    controller: AuthInvitationController,
    template: template
  };
}

// @ngInject
function AuthInvitationController(
  baseControllerClass,
  ENV,
  $state,
  $timeout,
  $auth,
  invitationService,
  ncUtilsFlash,
  $scope,
  acceptInvitationHandler) {
  var controllerScope = this;
  var Controller = baseControllerClass.extend({
    init: function() {
      if (!ENV.invitationsEnabled) {
        $state.go('errorPage.notFound');
        return;
      }
      var vm = this;
      vm.invitationUUID = $state.params.uuid;
      $scope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
        vm.previousState = from.name;
        vm.previousStateParams = fromParams;
      });

      vm.authenticated = $auth.isAuthenticated();
      invitationService.executeAction(vm.invitationUUID, 'check').then(vm.invitationCheckHandler.bind(vm))
        .catch(vm.invitationCatchHandler.bind(vm));
    },
    invitationCheckHandler: function() {
      var handler = function() {
        if (this.authenticated) {
          acceptInvitationHandler.acceptInvitation(this.invitationUUID, 'userIsAuthenticated');
          this.toNextState(null, this.authenticated);
        } else {
          invitationService.setInvitationToken(this.invitationUUID);
          $state.go('register');
        }
      };
      $timeout(handler.bind(this), ENV.invitationRedirectTime);
    },
    invitationCatchHandler: function(response) {
      if (response.status === 404) {
        ncUtilsFlash.error('Invitation is not found');
        this.toNextState(response.status, this.authenticated);
      } else {
        ncUtilsFlash.error('Invitation is not valid');
        this.toNextState(response.status, this.authenticated);
      }
    },
    toNextState: function(responseStatus, authenticated) {
      if (authenticated) {
        if (!this.previousState) {
          $state.go('dashboard.index');
        }
        $state.go(this.previousState, this.previousStateParams);
      } else {
        if (responseStatus === 400) {
          $state.go('errorPage.notFound');
        }
        $state.go('login');
      }
    }
  });

  controllerScope.__proto__ = new Controller();
}
