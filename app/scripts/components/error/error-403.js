import template from './error-403.html';

export const error403 = {
  template,
  controller: class error403Controller {
    constructor($rootScope, currentStateService, errorUtilsService, coreUtils, $state) {
      // @ngInject
      this.$rootScope = $rootScope;
      this.currentStateService = currentStateService;
      this.errorUtilsService = errorUtilsService;
      this.coreUtils = coreUtils;
      this.$state = $state;
    }

    $onInit() {
      this.customerUuid = this.currentStateService.getCustomerUuid();
      this.href = this.errorUtilsService.getBackLink(
        this.$rootScope.prevPreviousState, this.$rootScope.prevPreviousParams
      );
      let plansLink = this.$state.href('organization.plans', { uuid: this.customerUuid });
      let linkStart = `<a href="${plansLink}">`;
      let linkEnd = '</a>';

      this.updatePlanMessage = this.coreUtils.templateFormatter(gettext('To update current plan visit {linkStart}plans page{linkEnd}.'),
        { linkStart: linkStart, linkEnd: linkEnd });
    }
  }
};
