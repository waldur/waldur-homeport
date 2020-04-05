import languageList from './language-list';
import languageSelectorMenuItem from './language-selector-menu-item';
import LanguageUtilsService from './language-utils-service';

// @ngInject
function checkLanguage(LanguageUtilsService) {
  LanguageUtilsService.checkLanguage();
}

export default module => {
  module.service('LanguageUtilsService', LanguageUtilsService);
  module.component('languageSelectorMenuItem', languageSelectorMenuItem);
  module.component('languageList', languageList);
  module.run(checkLanguage);
};
