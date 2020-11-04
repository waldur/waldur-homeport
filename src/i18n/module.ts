import LanguageUtilsService from './language-utils-service';

function checkLanguage(LanguageUtilsService, $rootScope) {
  LanguageUtilsService.checkLanguage();
  $rootScope.$on('$translateRefreshEnd', () => {
    location.reload();
  });
}
checkLanguage.$inject = ['LanguageUtilsService', '$rootScope'];

export default (module) => {
  module.service('LanguageUtilsService', LanguageUtilsService);
  module.run(checkLanguage);
};
