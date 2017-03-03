import template from './language-list.html';
import './language-list.scss';

const languageList = {
  template: template,
  controller: class LanguageListController {
    constructor($translate, ENV) {
      // @ngInject
      this.$translate = $translate;
      this.languageChoices = ENV.languageChoices;
      var key = $translate.storageKey();
      var storage = $translate.storage();
      var current = storage.get(key);
      this.currentLanguage = this.findLanguageByCode(current);
    }

    selectLanguage(language) {
      this.currentLanguage = language;
      this.$translate.use(language.code);
    }

    findLanguageByCode(code) {
      return this.languageChoices.filter(language => language.code === code)[0];
    }
  }
};

export default languageList;
