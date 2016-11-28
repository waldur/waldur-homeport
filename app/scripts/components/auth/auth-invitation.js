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
                  vm.toNextState();
                });
              } else {
                ncUtilsFlash.error('Your civil number does not match number in invitation');
                $state.go('dashboard.index');
              }
            }, function() {
              $state.go('dashboard.index');
            });
          } else {
            invitationService.accept(invitationUUID).then(function() {
              ncUtilsFlash.success('Your invitation was accepted');
              vm.toNextState();
            });
          }
        });
      } else {
        invitationService.executeAction(invitationUUID, 'check').then(function() {

        }, function() {
          $state.go('errorPage.notFound');
        });
        invitationService.executeAction(invitationUUID, 'check').catch(function(response) {
          if (response.status === 400) {
            ncUtilsFlash.error('Invitation is not found');
            $state.go('errorPage.notFound');
          } else {
            ncUtilsFlash.error('Invitation is not valid');
            $state.go('login');
          }
        }).then(function() {
          invitationService.setInvitationToken(invitationUUID);
          $timeout(function() {
            $state.go('register');
          }, ENV.invitationRedirectTime);
        });
      }
    },
    toNextState: function() {
      var vm = this;
      if (!vm.previousState) {
        $state.go('dashboard.index');
      }
      $state.go(vm.previousState, vm.previousStateParams);
    }
  });

  controllerScope.__proto__ = new Controller();
}
