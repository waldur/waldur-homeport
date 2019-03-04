import template from './auth-login.html';

// TODO:
//
// 1) This controller should NOT depend on invitationService
//    and on invitations module in general, because it leads to circular dependency
//
// 2) In order to break circular dependency we need to implement registry of enabled
//    registration methods. When invitation token is checked,
//    this registry should be updated
//
export const authLogin = {
  template,
  bindings: {
    mode: '<' // Either "login" or "register"
  },
  controllerAs: 'auth',
  controller: class AuthLoginController {
    // @ngInject
    constructor(ENV, $q, $state, authService,
                ncUtilsFlash, invitationService, usersService, UserSettings, coreUtils) {
      this.ENV = ENV;
      this.$q = $q;
      this.$state = $state;
      this.authService = authService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.invitationService = invitationService;
      this.usersService = usersService;
      this.UserSettings = UserSettings;
      this.coreUtils = coreUtils;

      this.loginLogo = ENV.loginLogo;
      this.pageTitle = this.coreUtils.templateFormatter(gettext('Welcome to {pageTitle}!'), { pageTitle: ENV.shortPageTitle });
      this.shortPageTitle = ENV.shortPageTitle;

      this.methods = ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS.reduce((result, item) => {
        result[item] = true;
        return result;
      }, {});
      this.isSignupFormVisible = this.mode === 'register';
      this.user = {};
      this.errors = {};
      this.civilNumberRequired = false;
    }

    $onInit() {
      this.checkRegistrationMethods();
    }

    showLoginButton() {
      return this.methods.LOCAL_SIGNIN && this.isSignupFormVisible;
    }

    showLoginForm() {
      return this.methods.LOCAL_SIGNIN && !this.isSignupFormVisible;
    }

    showRegisterButton() {
      return !this.isSignupFormVisible &&
          (!this.ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED || this.ENV.plugins.WALDUR_CORE.ALLOW_SIGNUP_WITHOUT_INVITATION);
    }

    showRegisterForm() {
      return this.methods.LOCAL_SIGNUP && this.isSignupFormVisible && !this.civilNumberRequired;
    }

    showSocialSignup() {
      return this.methods.SOCIAL_SIGNUP && !this.civilNumberRequired;
    }

    showSocialSignupLabel() {
      return this.showSocialSignup() && this.SOCIAL_SIGNUP;
    }

    showGoogle() {
      return this.showSocialSignup() && !!this.ENV.plugins.WALDUR_AUTH_SOCIAL.GOOGLE_CLIENT_ID;
    }

    showFacebook() {
      return this.showSocialSignup() && !!this.ENV.plugins.WALDUR_AUTH_SOCIAL.FACEBOOK_CLIENT_ID;
    }

    showSmartId() {
      return this.showSocialSignup() && !!this.ENV.plugins.WALDUR_AUTH_SOCIAL.SMARTIDEE_CLIENT_ID;
    }

    showTARA() {
      return this.showSocialSignup() && !!this.ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_CLIENT_ID;
    }

    getTARALabel() {
      return this.ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_LABEL;
    }

    showEstonianId() {
      return this.methods.ESTONIAN_ID;
    }

    showValimo() {
      // Currently Valimo doesn't provide registration, only authentication is available
      return this.methods.VALIMO && this.mode !== 'register';
    }

    showSaml2() {
      return this.methods.SAML2 && !!this.ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL;
    }

    showSaml2Providers() {
      return this.methods.SAML2 && this.ENV.plugins.WALDUR_AUTH_SAML2.ALLOW_TO_SELECT_IDENTITY_PROVIDER;
    }

    gotoRegister() {
      this.isSignupFormVisible = true;
      this.$state.go('register');
    }

    gotoLogin() {
      this.isSignupFormVisible = false;
      this.$state.go('login');
    }

    checkRegistrationMethods() {
      /*
       This method validates invitation token for signup in four steps:

       1) check if invitations are enabled and user tries to signup;

       2) check if user is allowed to signup without invitation token;

       3) check if invitation token is present in local storage;

       4) check if invitation token is valid using REST API.
      */

      if (!this.ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED || this.mode !== 'register') {
        return;
      }

      if (this.ENV.plugins.WALDUR_CORE.ALLOW_SIGNUP_WITHOUT_INVITATION) {
        return;
      }

      const token = this.invitationService.getInvitationToken();
      if (!token) {
        this.ncUtilsFlash.error(gettext('Invitation token is not found.'));
        this.$state.go('errorPage.notFound');
        return;
      }

      this.invitationService.check(token).then(result => {
        if (result.data.civil_number_required) {
          this.civilNumberRequired = true;
        }
      }, () => {
        this.ncUtilsFlash.error(gettext('Unable to validate invitation token.'));
        this.$state.go('errorPage.notFound');
      });
    }

    signin() {
      if (this.LoginForm.$invalid) {
        return this.$q.reject();
      }
      this.errors = {};
      return this.authService.signin(this.user.username, this.user.password)
                 .then(this.loginSuccess.bind(this))
                 .catch(response => this.errors = response.data);
    }

    authenticate(provider) {
      return this.authService.authenticate(provider)
                 .then(this.loginSuccess.bind(this))
                 .catch(response => this.errors = response.data);
    }

    loginSuccess() {
      // TODO: Migrate to Angular-UI Router v1.0
      // And use $transition service which supports promises
      // https://github.com/angular-ui/ui-router/issues/1153
      return this.usersService.getCurrentUser().then(user => {
        const data = this.UserSettings.getSettings(user.uuid);
        if (data && data.name && data.params) {
          return this.$state.go(data.name, data.params);
        } else {
          return this.$state.go('profile.details', {}, {reload: true});
        }
      });
    }

    getErrors() {
      if (!this.errors) {
        return '';
      }

      let prettyErrors = [];
      if (angular.isString(this.errors)) {
        return [this.errors];
      }
      if (angular.isString(this.errors.detail)) {
        return [this.errors.detail];
      }
      for (let key in this.errors) {
        if (this.errors.hasOwnProperty(key)) {
          if (angular.isArray(this.errors[key])) {
            prettyErrors.push(key + ': ' + this.errors[key].join(', '));
          } else {
            prettyErrors.push(key + ': ' + this.errors[key]);
          }
        }
      }
      return prettyErrors;
    }

    signup() {
      if (this.RegisterForm.$invalid) {
        return this.$q.reject();
      }
      this.errors = {};
      return this.authService.signup(this.user).then(() => {
        this.ncUtilsFlash.info(gettext('Confirmation mail has been sent. Please check your inbox!'));
        this.isSignupFormVisible = false;
        this.user = {};
        return true;
      }, response => {
        this.errors = response.data;
      });
    }
  }
};
