import { router } from '@waldur/router';
import { USER_WORKSPACE } from '@waldur/workspace/types';

class StateUtilsServiceClass {
  private prevState;
  private prevParams;
  private prevWorkspace;

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
      router.stateService.go(this.prevState, this.prevParams);
    }
  }

  clear() {
    this.prevState = undefined;
    this.prevParams = undefined;
    this.prevWorkspace = undefined;
  }
}

export const StateUtilsService = new StateUtilsServiceClass();
