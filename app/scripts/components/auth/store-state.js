// @ngInject
export default function storeLastState($rootScope, $state, $injector, usersService, UserSettings) {
  $rootScope.$on('logoutStart', function() {
    const user_uuid = usersService.currentUser.uuid;
    const $stateParams = $injector.get('$stateParams');
    UserSettings.setSettings(user_uuid, {
      name: $state.current.name,
      params: $stateParams,
    });
  });

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
    if (fromState.name === 'login' && toState.name === 'profile.details') {
      return usersService.getCurrentUser().then(user => {
        const data = UserSettings.getSettings(user.uuid);
        if (data && data.name && data.params) {
          $state.go(data.name, data.params);
        }
      });
    }
  });
}

