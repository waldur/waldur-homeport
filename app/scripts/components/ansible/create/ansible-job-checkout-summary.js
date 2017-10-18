import template from './ansible-job-checkout-summary.html';

// @ngInject
class SummaryController {
  constructor(
    $scope,
    $http,
    currentStateService,
    AnsibleJobsService,
    OpenStackSummaryService,
    ErrorMessageFormatter) {
    this.$scope = $scope;
    this.$http = $http;
    this.currentStateService = currentStateService;
    this.AnsibleJobsService = AnsibleJobsService;
    this.OpenStackSummaryService = OpenStackSummaryService;
    this.ErrorMessageFormatter = ErrorMessageFormatter;
  }

  $onInit() {
    this.prices = {};
    this.requirements = {};
    this.loading = true;
    this.loadData().then(() => {
      this.loading = false;
      this.$scope.$digest();
    }).catch(() => {
      this.loading = false;
      this.error = true;
      this.$scope.$digest();
    });
  }

  async loadData() {
    this.project = await this.currentStateService.getProject();
    this.customer = await this.currentStateService.getCustomer();

    const resources = await this.OpenStackSummaryService.getServiceComponents(this.provider);
    this.prices = resources.components;

    this.requirements = await this.loadRequirements();
  }

  async loadRequirements() {
    const payload = this.AnsibleJobsService.getPayload(this.job, this.playbook, this.provider);
    const estimate = await this.AnsibleJobsService.estimate({
      ...payload,
      name: 'WALDUR_CHECK_ESTIMATE',
    });
    if (estimate.length !== 1) {
      return;
    }
    const model = estimate[0];

    const response = await this.$http.get(model.flavor);
    const flavor = response.data;
    return {
      cores: flavor.cores,
      ram: flavor.ram,
      disk: model.system_volume_size + (model.data_volume_size || 0),
    };
  }

  isValid() {
    return !this.error && this.prices && this.requirements;
  }

  getDailyPrice() {
    if (this.isValid()) {
      return this.requirements.cores * this.prices.cores +
             this.requirements.ram * this.prices.ram +
             this.requirements.disk * this.prices.disk;
    } else {
      return 0;
    }
  }

  getMonthlyPrice() {
    return this.getDailyPrice() * 30;
  }
}

const ansibleJobCheckoutSummary = {
  template: template,
  controller: SummaryController,
  bindings: {
    job: '<',
    provider: '<',
    playbook: '<',
  }
};

export default ansibleJobCheckoutSummary;
