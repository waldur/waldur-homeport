import template from './intro-button.html';

export default function introButton() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: IntroButtonController
  };
}


class IntroButtonController {
  // @ngInject
  constructor(ncIntroUtils) {
    this.ncIntroUtils = ncIntroUtils;
  }

  startIntro() {
    this.ncIntroUtils.start();
  }

  pageHasIntro() {
    return this.ncIntroUtils.pageHasIntro();
  }
}
