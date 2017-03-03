import template from './language-selector.html';

export default function languageSelector() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: class LanguageSelectorController {
      constructor($translate, ENV) {
        // @ngInject
        this.$translate = $translate;
        this.languageChoices = ENV.languageChoices;
        this.currentLanguage = this.findLanguageByCode($translate.use());
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
}
