import languageSelector from './language-selector';
import languageList from './language-list';
import LanguageUtilsService from './language-utils-service';
import languageSelectorMenuItem from './language-selector-menu-item';

export default module => {
  module.service('LanguageUtilsService', LanguageUtilsService);
  module.component('languageSelectorMenuItem', languageSelectorMenuItem);
  module.directive('languageSelector', languageSelector);
  module.component('languageList', languageList);
  module.run(checkLanguage);
};

// @ngInject
function checkLanguage(LanguageUtilsService) {
  LanguageUtilsService.checkLanguage();
}
