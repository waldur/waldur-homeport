import template from './error-404.html';

export const error404 = {
  template,
  controller: class error404Controller {
    // @ngInject
    constructor(NavigationUtilsService) {
      this.NavigationUtilsService = NavigationUtilsService;
    }

    goBack() {
      this.NavigationUtilsService.goBack();
    }
  }
};
