export default class ncIntroUtils {
  // @ngInject
  constructor($rootScope, $timeout, $window, ngIntroService, ENV, features) {
    this.$timeout = $timeout;
    this.ngIntroService = ngIntroService;
    this.ENV = ENV;
    this.features = features;
    this.$window = $window;
    this.state = {};
    $rootScope.$on('$stateChangeSuccess', this.cleanUp.bind(this));
  }

  intro(name, options) {
    this.cleanUp();
    this.state = {
      name: name,
      options: options,
    };
    this.ngIntroService.setOptions(this.state.options);

    let steps_passed = angular.fromJson(this.$window.localStorage['INTRO_STEPS']) || [];
    if (steps_passed.indexOf(name) !== -1) {
      return;
    } else {
      steps_passed.push(name);
      this.$window.localStorage['INTRO_STEPS'] = angular.toJson(steps_passed);
    }

    this.$timeout(this.start.bind(this), this.ENV.introJsDelay);
  }

  getState() {
    return this.state;
  }

  pageHasIntro() {
    return Boolean(this.state.options && this.state.options.steps);
  }

  onComplete(callback) {
    this.state.onComplete = callback;
    this.ngIntroService.onComplete(callback);
  }

  start() {
    if (this.features.isVisible('intro') && this.ENV.introJsAutostart) {
      this.ngIntroService.start();
    }
  }

  cleanUp() {
    this.ngIntroService.clear();
    this.state = {};
  }
}
