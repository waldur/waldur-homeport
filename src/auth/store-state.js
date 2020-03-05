// @ngInject
export default function storeLastState(
  $rootScope,
  $state,
  $injector,
  usersService,
  UserSettings,
) {
  $rootScope.$on('logoutStart', function() {
    if (usersService.currentUser) {
      const user_uuid = usersService.currentUser.uuid;
      const $stateParams = $injector.get('$stateParams');
      UserSettings.setSettings(user_uuid, {
        name: $state.current.name,
        params: $stateParams,
      });
    }
  });
}
