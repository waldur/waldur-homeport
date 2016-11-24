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
      var invitationUUID = $state.params.uuid;
      $scope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
        vm.previousState = from.name;
        vm.previousStateParams = fromParams;
      });

      if ($auth.isAuthenticated()) {
        invitationService.$get(invitationUUID).then(function(invitation) {
          if (invitation.civil_number) {
            usersService.getCurrentUser().then(function(user) {
              if (invitation.civil_number === user.civil_number) {
                invitationService.accept(invitationUUID).then(function() {
                  ncUtilsFlash.success('Your invitation was accepted');
                  $state.go(vm.previousState, vm.previousStateParams);
                });
              } else {
                ncUtilsFlash.error('Your civil number does not match number in invitation');
              }
            });
          } else {
            invitationService.accept(invitationUUID).then(function() {
                ncUtilsFlash.success('Your invitation was accepted');
                $state.go(vm.previousState, vm.previousStateParams);
            });
          }
        });
      } else {
        invitationService.executeAction(invitationUUID, 'check').then(function() {
          vm.setInvitationToken(invitationUUID);
        }, function() {
          $state.go('errorPage.notFound');
        });
      }
    },
    setInvitationToken: function(invitationUUID) {
      invitationService.setInvitationToken(invitationUUID);
      $timeout(function() {
        $state.go('register');
      }, ENV.invitationRedirectTime);
    }
  });

  controllerScope.__proto__ = new Controller();
}
