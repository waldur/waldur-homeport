const authButtonText = {
  template: '<span>{{$ctrl.prefix}} {{$ctrl.provider}}</span>',
  bindings: {
    mode: '<',  // Either "login" or "register"
    provider: '@',
  },
  controller: class AuthButtonTextController {
    $onInit() {
      this.prefix = this.mode === 'register' ? gettext('Register with') : gettext('Sign in with');
    }
  }
};

export default authButtonText;
