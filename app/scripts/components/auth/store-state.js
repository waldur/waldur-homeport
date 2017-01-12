export default module => {
  module.service('StateUtils', StateUtils);
  module.run(storeLastState);
};

// @ngInject
function storeLastState($rootScope, $state, $injector, usersService, StateUtils) {
  $rootScope.$on('logoutStart', function() {
    const user_uuid = usersService.currentUser.uuid;
    const $stateParams = $injector.get('$stateParams');
    StateUtils.setUserState(user_uuid, {
      name: $state.current.name,
      params: $stateParams,
    });
  });

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
    if (fromState.name === 'login' && toState.name === 'profile.details') {
      return usersService.getCurrentUser().then(user => {
        const data = StateUtils.getUserState(user.uuid);
        if (data && data.name && data.params) {
          $state.go(data.name, data.params);
        }
      });
    }
  });
}

// @ngInject
class StateUtils {
  constructor($window) {
    this.$window = $window;
  }

  setUserState(user_uuid, value) {
    let currentValue = this.$window.localStorage['lastUserState'];
    if (currentValue) {
      try {
        currentValue = JSON.parse(currentValue);
      } catch (e) {
        currentValue = {};
      }
    } else {
      currentValue = {};
    }
    currentValue = angular.extend(currentValue, {
      [user_uuid]: value
    });
    this.$window.localStorage['lastUserState'] = JSON.stringify(currentValue);
  }

  getUserState(user_uuid) {
    let data = this.$window.localStorage['lastUserState'];
    if (!data) {
      return;
    }
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
    return data[user_uuid];
  }
}
