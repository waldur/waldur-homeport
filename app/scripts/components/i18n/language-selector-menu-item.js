import template from './language-selector-menu-item.html';

const languageSelectorMenuItem = {
  template,
  controller: class LanguageSelectorMenuItemController {
    constructor(LanguageUtilsService) {
      // @ngInject
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

export default languageSelectorMenuItem;
