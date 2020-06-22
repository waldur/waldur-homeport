import { UsersService } from '@waldur/user/UsersService';

import { UserSettings } from './UserSettings';

// @ngInject
export default function storeLastState($rootScope, $state, $injector) {
  $rootScope.$on('logoutStart', function () {
    if (UsersService.currentUser) {
      const user_uuid = UsersService.currentUser.uuid;
      const $stateParams = $injector.get('$stateParams');
      UserSettings.setSettings(user_uuid, {
        name: $state.current.name,
        params: $stateParams,
      });
    }
  });
}
