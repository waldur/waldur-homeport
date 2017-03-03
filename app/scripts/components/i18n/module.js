import languageSelector from './language-selector';
import languageList from './language-list';

export default module => {
  module.directive('languageSelector', languageSelector);
  module.component('languageList', languageList);
  module.run(checkLanguage);
};

// @ngInject
function checkLanguage($translate, ENV) {
  // Check if current language is listed in choices and
  // switch to default language if current choice is invalid.

  function isValid(current) {
    for (var i=0; i < ENV.languageChoices.length; i++) {
      if (ENV.languageChoices[i].code === current) {
        return true;
      }
    }
    return false;
  }

  var key = $translate.storageKey();
  var storage = $translate.storage();
  var current = storage.get(key);
  if (!current || !isValid(current)) {
    $translate.use(ENV.defaultLanguage);
  }
}
