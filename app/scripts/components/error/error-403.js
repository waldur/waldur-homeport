import template from './error-403.html';

export const error403 = {
  template,
  controller: class error403Controller {
    constructor($rootScope, currentStateService, errorUtilsService) {
      // @ngInject
      this.$rootScope = $rootScope;
      this.currentStateService = currentStateService;
      this.errorUtilsService = errorUtilsService;
    }

    $onInit() {
      this.customerUuid = this.currentStateService.getCustomerUuid();
      this.href = this.errorUtilsService.getBackLink(
        this.$rootScope.prevPreviousState, this.$rootScope.prevPreviousParams
      );
    }
  }
};
