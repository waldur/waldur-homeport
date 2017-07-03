import template from './cookies-consent.html';
import './cookies-consent.scss';

const cookiesConsent = {
  template,
  controller: class CookiesConsentController {
    // @ngInject
    constructor($cookies) {
      this.cookies = $cookies;
    }

    consentDisplayed() {
      return this.cookies.get('consentDisplayed');
    }

    hideConsent() {
      this.cookies.put('consentDisplayed', false);
    }
  }
};

export default cookiesConsent;
