// @ngInject
export default class CostPlanningFormatter {
  constructor($filter) {
    this.$filter = $filter;
  }

  formatFlavor(flavor) {
    return `${flavor.name} (${this.$filter('formatFlavor')(flavor)})`;
  }

  formatPreset(preset) {
    return `${preset.category} / ${preset.variant} ${preset.name}`;
  }

  formatPlan(item) {
    const price = this.$filter('defaultCurrency')(item.price);
    const preset = this.formatPreset(item.preset);
    const flavor = this.formatFlavor(item.size);
    return `${preset} &mdash; ${flavor} &mdash; ${price}`;
  }

  formatPresets(plan) {
    return plan.optimized_presets.map(this.formatPlan.bind(this)).join('<br/>');
  }
}
