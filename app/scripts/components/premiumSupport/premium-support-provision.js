import template from './premium-support-provision.html';

export default function premiumSupportProvision() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    controller: PremiumSupportProvisionController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}

// @ngInject
class PremiumSupportProvisionController {
  constructor(
    premiumSupportPlansService,
    premiumSupportContractsService,
    $rootScope,
    $state,
    $q,
    ncUtilsFlash,
    currentStateService) {
    this.plansService = premiumSupportPlansService;
    this.contractsService = premiumSupportContractsService;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$q = $q;
    this.ncUtilsFlash = ncUtilsFlash;
    this.currentStateService = currentStateService;
    this.init();
  }

  init() {
    this.loading = true;
    this.fetchInitialData().finally(() => {
      this.loading = false;
    });
  }

  fetchInitialData() {
    return this.$q.all([
      this.plansService.getList().then(plans => {
        this.plans = plans;
      }),
      this.currentStateService.getCustomer().then(customer => {
        this.currentCustomer = customer;
      }),
      this.currentStateService.getProject().then(project => {
        this.currentProject = project;
      })
    ]);
  }

  selectPlan(plan) {
    this.selectedPlan = plan;
  }

  submit() {
    let contract = this.contractsService.$create();
    contract.project = this.currentProject.url;
    contract.plan = this.selectedPlan.url;
    return contract.$save().then(() => {
      this.contractsService.clearAllCacheForCurrentEndpoint();
      this.$rootScope.$broadcast('refreshProjectList');
      this.$state.go('project.support', {uuid: this.currentProject.uuid});
      return true;
    }).catch(response => {
      this.errors = response.data;
      this.ncUtilsFlash.error(gettext('Unable to create premium support contract.'));
    });
  }
}
