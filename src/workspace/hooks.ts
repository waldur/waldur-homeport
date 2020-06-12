import store from '@waldur/store/store';

import {
  userLoggedIn,
  userUpdated,
  userLoggedOut,
  setCurrentWorkspace,
} from './actions';

export function attachHooks($rootScope, authService, WorkspaceService) {
  $rootScope.$on('authService:signin', () => {
    store.dispatch(userLoggedIn(authService.user));
  });

  $rootScope.$on('CURRENT_USER_UPDATED', (_, { user }) => {
    store.dispatch(userUpdated(user));
  });

  $rootScope.$on('logoutStart', () => {
    store.dispatch(userLoggedOut());
  });

  $rootScope.$on('WORKSPACE_CHANGED', () => {
    const data = WorkspaceService.getWorkspace();
    store.dispatch(setCurrentWorkspace(data.workspace));
  });
}

attachHooks.$inject = ['$rootScope', 'authService', 'WorkspaceService'];
