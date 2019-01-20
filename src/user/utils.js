// @ngInject
export function stateUtilsService($state) {
  let vm = this;

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

  vm.clear = function() {
    vm.prevState = undefined;
    vm.prevParams = undefined;
    vm.prevWorkspace = undefined;
  };
}

// @ngInject
export function attachStateUtils($rootScope, stateUtilsService) {
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    stateUtilsService.setPrevState(fromState, fromParams);
  });
}
