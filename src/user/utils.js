import { $state } from '@waldur/core/services';
import { USER_WORKSPACE } from '@waldur/workspace/types';

export class StateUtilsService {
  setPrevState(state, params) {
    if (
      state.data &&
      state.data.workspace &&
      state.data.workspace !== USER_WORKSPACE
    ) {
      this.prevState = state;
      this.prevParams = params;
      this.prevWorkspace = state.data.workspace;
    }
  }

  getPrevWorkspace() {
    return this.prevWorkspace;
  }

  goBack() {
    if (this.prevState) {
      $state.go(this.prevState, this.prevParams);
    }
  }

  clear() {
    this.prevState = undefined;
    this.prevParams = undefined;
    this.prevWorkspace = undefined;
  }
}

// @ngInject
export function attachStateUtils($rootScope, StateUtilsService) {
  $rootScope.$on('$stateChangeSuccess', function (
    event,
    toState,
    toParams,
    fromState,
    fromParams,
  ) {
    StateUtilsService.setPrevState(fromState, fromParams);
  });
}
