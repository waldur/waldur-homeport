import store from '@waldur/store/store';
import { getUser } from '@waldur/workspace/selectors';

import { UserSettings } from './UserSettings';

// @ngInject
export default function storeLastState($rootScope, $state, $injector) {
  $rootScope.$on('logoutStart', function () {
    if (getUser(store.getState())) {
      const user_uuid = getUser(store.getState()).uuid;
      const $stateParams = $injector.get('$stateParams');
      UserSettings.setSettings(user_uuid, {
        name: $state.current.name,
        params: $stateParams,
      });
    }
  });
}
