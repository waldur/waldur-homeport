import template from './error-403.html';

export const error403 = {
  template,
  controller: class error403Controller {
    // @ngInject
    constructor(currentStateService, NavigationUtilsService, coreUtils, $state) {
      this.currentStateService = currentStateService;
      this.NavigationUtilsService = NavigationUtilsService;
      this.coreUtils = coreUtils;
      this.$state = $state;
    }

    $onInit() {
      this.customerUuid = this.currentStateService.getCustomerUuid();
      let link = this.$state.href('organization.plans', { uuid: this.customerUuid });
      this.updatePlanMessage = this.coreUtils.templateFormatter(gettext('To update current plan visit <a href="{link}">plans page</a>.'),
        { link: link });
    }

    goBack() {
      this.NavigationUtilsService.goBack();
    }
  }
};
