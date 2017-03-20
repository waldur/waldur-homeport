import template from './openstack-instance-checkout-summary.html';

export default function openstackInstanceCheckoutSummary() {
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
            gettext('<span>Note that this virtual machine is charged as part of </span><strong>{serviceName}</strong><span translate>package.</span>'),
            { serviceName: this.model.service.name });
        this.componentsMessage = this.$filter('translate')(this.componentsMessage);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  isValid() {
    return this.getDailyPrice();
  }

  getDailyPrice() {
    if (this.components && this.model.flavor) {
      return this.model.flavor.cores * this.components.cores +
             this.model.flavor.ram * this.components.ram +
             this.getTotalStorage() * this.components.disk;
    }
  }

  getMonthlyPrice() {
    return this.getDailyPrice() * 30;
  }

  getTotalStorage() {
    return this.model.system_volume_size + this.model.data_volume_size;
  }
}

