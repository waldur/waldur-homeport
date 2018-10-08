import template from './invalid-quota-page.html';

const invalidQuotaPage = {
  template,
  controller: class InvalidQuotaPageController {
    // @ngInject
    constructor(NavigationUtilsService) {
      this.NavigationUtilsService = NavigationUtilsService;
    }

    goBack() {
      this.NavigationUtilsService.goBack();
    }
  }
};

export default invalidQuotaPage;
