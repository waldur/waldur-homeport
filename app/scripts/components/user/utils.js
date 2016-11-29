// @ngInject
export function stateUtilsService($state) {
  var vm = this;

  vm.setPrevState = function(state, params) {
    if (state.data && state.data.workspace && state.data.workspace !== 'user') {
      vm.prevState = state;
      vm.prevParams = params;
      vm.prevWorkspace = state.data.workspace;
    }
  };

  vm.getPrevWorkspace = function() {
    return vm.prevWorkspace;
  };

  vm.goBack = function() {
    if (vm.prevState) {
      $state.go(vm.prevState, vm.prevParams);
    }
  };
}

// @ngInject
export function attachStateUtils($rootScope, stateUtilsService) {
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    stateUtilsService.setPrevState(fromState, fromParams);
  });
}

// @ngInject
export function attachInvitationUtils($rootScope, invitationService, ncUtilsFlash) {
  $rootScope.$on('authService:signin', function() {
      var token = invitationService.getInvitationToken();
      if (token) {
        invitationService.accept(token).then(function() {
          ncUtilsFlash.success('Your invitation was accepted');
          invitationService.clearInvitationToken();
        }, function(response) {
          if (response.status === 400) {
            ncUtilsFlash.error('Invitation is invalid');
          } else {
            ncUtilsFlash.error('Unable to accept invitation');
          }
          invitationService.clearInvitationToken();
        });
      }
  });
}
