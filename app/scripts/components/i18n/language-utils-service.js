// @ngInject
export default class LanguageUtilsService {
  constructor($translate, $http, ENV) {
    this.$translate = $translate;
    this.$http = $http;
    this.ENV = ENV;
  }

  getCurrentLanguage() {
    return this.current;
  }

  setCurrentLanguage(language) {
    this.current = language;
    this.$translate.use(language.code);
    this.$http.defaults.headers.common['Accept-Language'] = language.code;
  }

  checkLanguage() {
    // Check if current language is listed in choices and
    // switch to default language if current choice is invalid.
    const key = this.$translate.storageKey();
    const storage = this.$translate.storage();
    const code = storage.get(key);
    const current = this.findLanguageByCode(code) || this.findLanguageByCode(this.ENV.defaultLanguage);
    this.setCurrentLanguage(current);
  }

  findLanguageByCode(code) {
    if (!code) {
      return;
    }
    return this.getChoices().filter(language => language.code === code)[0];
  }

  getChoices() {
    return this.ENV.languageChoices;
  }
}
