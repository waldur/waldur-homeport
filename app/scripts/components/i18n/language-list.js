import template from './language-list.html';
import './language-list.scss';

const languageList = {
  template: template,
  controller: class LanguageListController {
    constructor(LanguageUtilsService) {
      // @ngInject
      this.utils = LanguageUtilsService;
    }

    $onInit() {
      this.languageChoices = this.utils.getChoices();
      this.currentLanguage = this.utils.getCurrentLanguage();
      this.visible = this.languageChoices.length > 1;
      this.selectBox = this.languageChoices.length > 3;
    }

    selectLanguage(language) {
      this.currentLanguage = language;
      this.utils.setCurrentLanguage(language);
    }
  }
};

export default languageList;
