const KEY = 'USER_SETTINGS';

export default class UserSettings {
  // @ngInject
  constructor($window) {
    this.$window = $window;
  }

  setSettings(user_uuid, value) {
    let currentValue = this.$window.localStorage[KEY];
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
      [user_uuid]: value,
    });
    this.$window.localStorage[KEY] = JSON.stringify(currentValue);
  }

  getSettings(user_uuid) {
    let data = this.$window.localStorage[KEY];
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
