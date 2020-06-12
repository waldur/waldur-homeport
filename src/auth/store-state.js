import { UsersService } from '@waldur/user/UsersService';

// @ngInject
export default function storeLastState(
  $rootScope,
  $state,
  $injector,
  UserSettings,
) {
  $rootScope.$on('logoutStart', function() {
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
