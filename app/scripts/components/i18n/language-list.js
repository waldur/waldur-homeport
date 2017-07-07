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
    }

    visible() {
      return this.languageChoices.length > 1;
    }

    displayAsSelectBox() {
      return this.languageChoices.length > 3;
    }

    selectLanguage() {
      this.utils.setCurrentLanguage(this.currentLanguage);
    }
  }
};

export default languageList;
