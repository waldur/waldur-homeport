const KEY = 'USER_SETTINGS';

export const UserSettings = {
  setSettings(user_uuid, value) {
    let currentValue = localStorage[KEY];
    if (currentValue) {
      try {
        currentValue = JSON.parse(currentValue);
      } catch (e) {
        currentValue = {};
      }
    } else {
      currentValue = {};
    }
    currentValue = Object.assign(currentValue, {
      [user_uuid]: value,
    });
    localStorage[KEY] = JSON.stringify(currentValue);
  },

  getSettings(user_uuid) {
    let data = localStorage[KEY];
    if (!data) {
      return;
    }
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
    return data[user_uuid];
  },
};
