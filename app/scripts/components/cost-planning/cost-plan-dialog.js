import template from './cost-plan-dialog.html';

const costPlanDialog = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
  controller: class CostPlanDialogController {
    constructor(costPlansService, costPresetsService, certificationsService, $q) {
      // @ngInject
      this.costPlansService = costPlansService;
      this.costPresetsService = costPresetsService;
      this.certificationsService = certificationsService;
      this.$q = $q;
    }

    $onInit() {
      this.loadData();

      this.customer = this.resolve.customer;
      if (this.resolve.plan) {
        this.plan = angular.copy(this.resolve.plan);
      } else {
        this.plan = {
          name: gettext('New plan'),
          items: []
        };
        this.addItem();
      }
    }

    loadData() {
      this.loading = true;
      this.$q.all([
        this.costPresetsService.getAll().then(presets => this.presets = presets),
        this.certificationsService.getAll().then(certifications => this.certifications = certifications),
      ]).finally(() => this.loading = false);
    }

    addItem() {
      this.plan.items.push({
        quantity: 1
      })
    }

    deleteItem(item) {
      const index = this.plan.items.indexOf(item);
      this.items.splice(index, 1);
    }

    save() {
      this.loading = true;
      let plan = this.costPlansService.$create();
      plan.name = this.plan.name;
      plan.customer = this.customer.url;
      plan.items = this.plan.items.map(item => ({
        preset: item.preset.url,
        quantity: item.quantity,
      }));
      plan.certifications = this.plan.certifications.map(({url}) => ({url}));

      let promise;
      if (this.resolve.plan) {
        plan.url = this.plan.url;
        promise = this.costPlansService.update(plan);
      } else {
        promise = plan.$save()
      }

      promise.finally(() => this.loading = false);
      this.close();
    }
  }
};

export default costPlanDialog;
