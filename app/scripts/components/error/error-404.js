import template from './error-404.html';

export const error404 = {
  template,
  controller: class error404Controller {
    constructor($rootScope, errorUtilsService) {
      // @ngInject
      this.$rootScope = $rootScope;
      this.errorUtilsService = errorUtilsService;
    }

    $onInit() {
      this.href = this.errorUtilsService.getBackLink(
        this.$rootScope.prevPreviousState, this.$rootScope.prevPreviousParams
      );
    }
  }
};
