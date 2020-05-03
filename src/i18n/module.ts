import LanguageUtilsService from './language-utils-service';
import languageList from './LanguageList';
import languageSelectorMenuItem from './LanguageSelectorMenuItem';

function checkLanguage(LanguageUtilsService) {
  LanguageUtilsService.checkLanguage();
}
checkLanguage.$inject = ['LanguageUtilsService'];

export default module => {
  module.service('LanguageUtilsService', LanguageUtilsService);
  module.component('languageSelectorMenuItem', languageSelectorMenuItem);
  module.component('languageList', languageList);
  module.run(checkLanguage);
};
