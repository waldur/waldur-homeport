import template from './language-selector.html';

export default function languageSelector() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: class LogoutLinkController {
      constructor($translate, LANGUAGE) {
        // @ngInject
        this.$translate = $translate;
        this.languageChoices = LANGUAGE.CHOICES;
        this.currentLanguage = this.findLanguageByCode($translate.use())
      }

      selectLanguage(language) {
        this.$translate.use(language);
      }

      findLanguageByCode(code) {
        return this.languageChoices.filter(language => language.code === code)[0];
      }
    }
  }
};
