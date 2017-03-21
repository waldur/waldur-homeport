import template from './error-403.html';

export const error403 = {
  template,
  controller: class error403Controller {
    constructor($rootScope, currentStateService, errorUtilsService, coreUtils) {
      // @ngInject
      this.$rootScope = $rootScope;
      this.currentStateService = currentStateService;
      this.errorUtilsService = errorUtilsService;
      this.coreUtils = coreUtils;
    }

    $onInit() {
      this.customerUuid = this.currentStateService.getCustomerUuid();
      this.href = this.errorUtilsService.getBackLink(
        this.$rootScope.prevPreviousState, this.$rootScope.prevPreviousParams
      );
      this.updatePlanMessage = this.coreUtils.templateFormatter(gettext('To update current plan visit <a ui-sref="organization.plans({customerUuid})">plans page</a>'),
        { customerUuid: `{uuid: ${this.customerUuid}}` });
    }
  }
};
