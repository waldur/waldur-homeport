import template from './invalid-object-page.html';

const invalidObjectPage = {
  template,
  controller: class InvalidObjectPageController {
    // @ngInject
    constructor(NavigationUtilsService) {
      this.NavigationUtilsService = NavigationUtilsService;
    }

    goBack() {
      this.NavigationUtilsService.goBack();
    }
  }
};

export default invalidObjectPage;
