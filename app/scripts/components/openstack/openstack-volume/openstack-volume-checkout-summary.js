import template from './openstack-volume-checkout-summary.html';

export default function openstackVolumeCheckoutSummary() {
  return {
    restrict: 'E',
    template: template,
    controller: SummaryController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      model: '='
    }
  };
}

// @ngInject
class SummaryController {
  constructor(OpenStackSummaryService, coreUtils, $filter) {
    this.OpenStackSummaryService = OpenStackSummaryService;
    this.coreUtils = coreUtils;
    this.$filter = $filter;
    this.init();
  }

  init() {
    this.loading = true;
    this.components = {};
    this.OpenStackSummaryService.getServiceComponents(this.model.service)
      .then(components => {
        this.components = components;
        this.componentsMessage =
          this.coreUtils.templateFormatter(
            gettext('Note that this volume is charged as part of <strong>{serviceName}</strong> package.'),
            { serviceName: this.model.service.name });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  getDailyPrice() {
    if (this.components && this.model.size) {
      return this.model.size * this.components.disk;
    }
  }

  getMonthlyPrice() {
    return this.getDailyPrice() * 30;
  }
}

