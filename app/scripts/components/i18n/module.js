import languageSelector from './language-selector';
import languageList from './language-list';
import LanguageUtilsService from './language-utils-service';

export default module => {
  module.service('LanguageUtilsService', LanguageUtilsService);
  module.directive('languageSelector', languageSelector);
  module.component('languageList', languageList);
  module.run(checkLanguage);
};

// @ngInject
function checkLanguage(LanguageUtilsService) {
  LanguageUtilsService.checkLanguage();
}
