import LanguageUtilsService from './language-utils-service';

function checkLanguage(LanguageUtilsService) {
  LanguageUtilsService.checkLanguage();
}
checkLanguage.$inject = ['LanguageUtilsService'];

export default (module) => {
  module.service('LanguageUtilsService', LanguageUtilsService);
  module.run(checkLanguage);
};
