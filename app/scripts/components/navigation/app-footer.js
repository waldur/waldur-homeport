import template from './app-footer.html';

export const appFooter = {
  template,
  controller: class AppFooterController {
    constructor(ENV) {
      this.buildId = ENV.buildId;
    }
  }
};
