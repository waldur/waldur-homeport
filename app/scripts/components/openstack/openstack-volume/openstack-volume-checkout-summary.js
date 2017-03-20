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
            gettext('<span>Note that this volume is charged as part of </span><strong>{serviceName}</strong><span translate>package.</span>'),
            { serviceName: this.model.service.name });
        this.componentsMessage = this.$filter('translate')(this.componentsMessage);
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

