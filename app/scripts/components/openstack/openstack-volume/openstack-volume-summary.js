import template from './openstack-volume-summary.html';

export default function openstackVolumeSummary() {
  return {
    restrict: 'E',
    template: template,
    controller: SummaryController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      model: '='
    }
  }
}

// @ngInject
class SummaryController {
  constructor(OpenStackSummaryService) {
    this.OpenStackSummaryService = OpenStackSummaryService;
    this.init();
  }

  init() {
    this.loading = true;
    this.components = {};
    this.OpenStackSummaryService.getServiceComponents(this.model.service)
      .then(components => {
        this.components = components
      })
      .finally(() => {
        this.loading = false;
      });
  }

  getDailyPrice() {
    if (this.components && this.model.size) {
      return this.model.size * this.components.storage;
    }
  }

  getMonthlyPrice() {
    return this.getDailyPrice() * 30;
  }
}

