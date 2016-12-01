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
export function attachInvitationUtils($rootScope, invitationService, acceptInvitationHandler) {
  $rootScope.$on('authService:signin', function() {
    var token = invitationService.getInvitationToken();
    if (token) {
      acceptInvitationHandler.acceptInvitation(token);            
    }
  });
}

// @ngInject
export function acceptInvitationHandler(invitationService, ncUtilsFlash, $auth, $rootScope) {
  $rootScope.$on('currentCustomerUpdated', function() {
    $rootScope.$broadcast('refreshProjectList');
  });

  this.acceptInvitation = (invitationToken) => {
    return invitationService.accept(invitationToken).then(function() {
      ncUtilsFlash.success('Your invitation was accepted');
      invitationService.clearInvitationToken();
      if ($auth.isAuthenticated()) {
        $rootScope.$broadcast('refreshCustomerList', {updateSignal: true});
      }
    }).catch(function(response) {
      if (response.status === 404) {
        ncUtilsFlash.error('Invitation is not found');
      } else if (response.status === 400) {
        invitationService.clearInvitationToken();
        ncUtilsFlash.error('Invitation is not valid');
      } else if (response.status === 500) {
        ncUtilsFlash.error('Internal server error occurred. Please try again or contact support.');
      }
    });
  };
}

