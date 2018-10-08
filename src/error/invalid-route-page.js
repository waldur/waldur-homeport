import template from './invalid-route-page.html';

const invalidRoutePage = {
  template,
  controller: class InvalidRoutePageController {
    // @ngInject
    constructor(NavigationUtilsService) {
      this.NavigationUtilsService = NavigationUtilsService;
    }

    goBack() {
      this.NavigationUtilsService.goBack();
    }
  }
};

export default invalidRoutePage;
