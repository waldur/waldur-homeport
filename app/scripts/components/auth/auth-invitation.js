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

      invitationService.executeAction(vm.invitationUUID, 'check')
        .then(vm.invitationCheckHandler.bind(vm))
        .catch(vm.invitationCatchHandler.bind(vm));
    },
    invitationCheckHandler: function() {
      var vm = this;
      var handler = function() {
        if ($auth.isAuthenticated()) {
          acceptInvitationHandler.acceptInvitation(vm.invitationUUID)
            .then(vm.toNextState.bind(vm, false));
        } else {
          invitationService.setInvitationToken(vm.invitationUUID);
          $state.go('register');
        }
      };
      $timeout(handler.bind(this), ENV.invitationRedirectTime);
    },
    invitationCatchHandler: function(response) {
      if (response.status === 404) {
        ncUtilsFlash.error('Invitation is not found');
      } else if (response.status === 400) {
        ncUtilsFlash.error('Invitation is not valid');
      } else if (response.status === 500) {
        ncUtilsFlash.error('Internal server error occurred. Please try again or contact support.');
      }
      this.toNextState(true);
    },
    toNextState: function(responseErrorStatus) {
      if ($auth.isAuthenticated()) {
        if (!this.previousState) {
          $state.go('dashboard.index');
        } else {
          $state.go(this.previousState, this.previousStateParams);
        }
      } else {
        if (responseErrorStatus) {
          $state.go('errorPage.notFound');
        } else {
          $state.go('login');
        }
      }
    }
  });

  controllerScope.__proto__ = new Controller();
}
