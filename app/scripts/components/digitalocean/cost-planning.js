// @ngInject
export default function costPlanningConfig(costPlanOptimizerService, $filter) {
  function formatPlan(item) {
    const price = $filter('defaultCurrency')(item.price);
    const preset = `${item.preset.category} / ${item.preset.variant}`;
    const flavor = `${item.size.name} (${$filter('formatFlavor')(item.size)})`;
    return `${preset} &mdash; ${flavor} &mdash; ${price}`;
  }
  costPlanOptimizerService.pushPostprocessor(plan => {
    if (plan.optimized_presets) {
      plan.details = plan.optimized_presets.map(formatPlan).join('<br/>');
    }
    return plan;
  });
}
