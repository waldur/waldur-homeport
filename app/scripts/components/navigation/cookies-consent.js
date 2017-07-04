import template from './cookies-consent.html';
import './cookies-consent.scss';

const cookiesConsent = {
  template,
  controller: class CookiesConsentController {
    // @ngInject
    constructor($window) {
      this.$window = $window;
    }

    consentHidden() {
      return this.$window.localStorage['hideCookiesConsent'];
    }

    hideConsent() {
      this.$window.localStorage['hideCookiesConsent'] = true;
    }
  }
};

export default cookiesConsent;
