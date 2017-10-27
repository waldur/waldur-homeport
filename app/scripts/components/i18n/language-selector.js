import template from './language-selector.html';

export default function languageSelector() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: class LanguageSelectorController {
      // @ngInject
      constructor(LanguageUtilsService) {
        this.utils = LanguageUtilsService;
        this.languageChoices = this.utils.getChoices();
        this.currentLanguage = this.utils.getCurrentLanguage();
      }

      selectLanguage(language) {
        this.currentLanguage = language;
        this.utils.setCurrentLanguage(language);
      }
    }
  };
}
