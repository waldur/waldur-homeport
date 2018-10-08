import template from './cost-plan-dialog.html';

// Although it is not used directly as these labels come from backend
// they are listed explicitly in order to extract labels for translation.
// eslint-disable-next-line no-unused-vars
const PRESET_VARIANTS = [
  gettext('Small'),
  gettext('Medium'),
  gettext('Large'),
];

const costPlanDialog = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
  controller: class CostPlanDialogController {
    // @ngInject
    constructor(
      costPlansService,
      costPresetsService,
      certificationsService,
      costPlanOptimizerService,
      $q) {
      this.costPlansService = costPlansService;
      this.costPresetsService = costPresetsService;
      this.certificationsService = certificationsService;
      this.costPlanOptimizerService = costPlanOptimizerService;
      this.$q = $q;
    }

    $onInit() {
      this.loadData();

      this.project = this.resolve.project;
      if (this.resolve.plan) {
        this.plan = angular.copy(this.resolve.plan);
      } else {
        this.plan = {
          name: gettext('New plan'),
          items: [],
          certifications: []
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
        quantity: 1,
      });
    }

    deleteItem(item) {
      const index = this.plan.items.indexOf(item);
      this.plan.items.splice(index, 1);
    }

    saveAndClose() {
      return this.save().then(() => this.close());
    }

    save() {
      const items = this.getValidItems();
      let plan = this.costPlansService.$create();
      plan.name = this.plan.name;
      plan.project = this.project.url;
      plan.items = items.map(item => ({
        preset: item.preset.url,
        quantity: item.quantity,
      }));
      plan.certifications = this.plan.certifications.map(({url}) => ({url}));

      let promise;
      if (this.plan.url) {
        plan.url = this.plan.url;
        promise = this.costPlansService.update(plan);
      } else {
        promise = plan.$save().then(plan => this.plan.url = plan.url);
      }

      this.saving = true;
      return promise
        .finally(() => this.saving = false);
    }

    getTotalConsumption() {
      let cores = 0, ram = 0, disk = 0;
      const items = this.getValidItems();
      angular.forEach(items, item => {
        cores += item.preset.cores * item.quantity;
        ram += item.preset.ram * item.quantity;
        disk += item.preset.disk * item.quantity;
      });
      return {cores, ram, disk};
    }

    getValidItems() {
      return this.plan.items.filter(item => item.preset);
    }

    isValidPlan() {
      return this.getValidItems().length > 0;
    }

    saveAndEvaluate() {
      this.save().then(() => this.evaluatePlan());
    }

    evaluatePlan() {
      this.isEvaluating = true;
      this.costPlanOptimizerService.evaluate(this.plan)
        .then(services => this.optimalServices = services)
        .finally(() => this.isEvaluating = false);
    }
  }
};

export default costPlanDialog;
