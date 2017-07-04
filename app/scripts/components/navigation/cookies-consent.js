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
      return this.$window.sessionStorage['hideCookiesConsent'];
    }

    hideConsent() {
      this.$window.sessionStorage['hideCookiesConsent'] = true;
    }
  }
};

export default cookiesConsent;
