import template from './auth-valimo-dialog.html';
import delay from './delay';

const authValimoDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
  },
  controller: class AuthValimoDialogController {
    // @ngInject
    constructor($scope, $rootScope, $state, authService, AuthValimoService, ncUtilsFlash, ENV) {
      this.$scope = $scope;
      this.$rootScope = $rootScope;
      this.$state = $state;
      this.authService = authService;
      this.AuthValimoService = AuthValimoService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.ENV = ENV;
    }

    $onInit() {
      this.$rootScope.$broadcast('enableRequests');
      this.isAlive = true;
      this.mobilePrefix = this.ENV.plugins.WALDUR_AUTH_VALIMO.MOBILE_PREFIX;
    }

    $onDestroy() {
      this.isAlive = false;
    }

    submit() {
      this.isAuthenticating = true;
      return this.AuthValimoService.login(this.mobilePrefix.concat(this.phoneNumber)).then(result => {
        this.challengeCode = result.message;
        this.authResultId = result.uuid;
      }).then(() => {
        return this.pollAuthResult(this.authResultId).then(result => this.parseAuthResult(result));
      }).catch(response => {
        this.ncUtilsFlash.errorFromResponse(response, gettext('Unable to authenticate using Mobile ID.'));
      }).finally(() => {
        this.isAuthenticating = false;
      });
    }

    async pollAuthResult() {
      let result;
      do {
        result = await this.AuthValimoService.getAuthResult(this.authResultId);
        await delay(2000);
      } while (this.isAlive && (result.state === 'Scheduled' || result.state === 'Processing'));
      this.$scope.$digest();
      return result;
    }

    parseAuthResult(result) {
      if (!this.isAlive) {
        return;
      }
      if (result.state === 'OK') {
        this.authService.loginSuccess({data: {token: result.token, method: 'valimo'}});
        this.$state.go('profile.details');
      } else if (result.state === 'Canceled') {
        if (result.details === 'User is not registered.') {
          this.ncUtilsFlash.error(result.details);
          return;
        }
        const message = gettext('Authentication with Mobile ID has been canceled by user or timed out. Details:');
        this.ncUtilsFlash.error(message + result.details);
      } else {
        this.ncUtilsFlash.error(gettext('Unexpected exception happened during login process.'));
      }
    }
  }
};

export default authValimoDialog;
