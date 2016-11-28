import template from './auth-invitation.html';

export default function authInvitation() {
  return {
    restrict: 'E',
    controller: AuthInvitationController,
    template: template,
  };
}

// @ngInject
function AuthInvitationController(
  baseControllerClass,
  ENV,
  $state,
  $timeout,
  $auth,
  usersService,
  invitationService,
  ncUtilsFlash,
  $scope) {
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
      if (vm.authenticated) {
        invitationService.executeAction(vm.invitationUUID, 'check').catch(vm.invitationCatchHandler.bind(vm))
          .then(vm.invitationCheckHandler.bind(vm));
      } else {
        invitationService.executeAction(vm.invitationUUID, 'check').catch(vm.invitationCatchHandler.bind(vm))
          .then(vm.invitationCheckHandler.bind(vm));
      }
    },
    invitationCheckHandler: function() {
      var vm = this;
      $timeout(function() {
        if (vm.authenticated) {
          vm.acceptInvitation();
          vm.toNextState(null, vm.authenticated);
        } else {
          invitationService.setInvitationToken(vm.invitationUUID);
          $state.go('register');
        }
      }, ENV.invitationRedirectTime);
    },
    acceptInvitation: function() {
      var vm = this;
      invitationService.accept(vm.invitationUUID).then(function() {
        ncUtilsFlash.success('Your invitation was accepted');
        invitationService.clearInvitationToken();
      }, function() {
        ncUtilsFlash.error('Unable to accept invitation');
        invitationService.clearInvitationToken();
      });
    },
    invitationCatchHandler: function(response) {
      var vm = this;
      if (response.status === 400) {
        ncUtilsFlash.error('Invitation is not found');
        this.toNextState(response.status, vm.authenticated);
      } else {
        ncUtilsFlash.error('Invitation is not valid');
        this.toNextState(response.status, vm.authenticated);
      }
    },
    toNextState: function(responseStatus, authenticated) {
      var vm = this;
      if (authenticated) {
        if (!vm.previousState) {
          return $state.go('dashboard.index');
        }
        $state.go(vm.previousState, vm.previousStateParams);
      } else {
        if (responseStatus === 400) {
          return $state.go('errorPage.notFound');
        }
        $state.go('login');
      }
    }
  });

  controllerScope.__proto__ = new Controller();
}
