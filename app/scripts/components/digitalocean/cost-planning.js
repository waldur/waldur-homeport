// @ngInject
export default function costPlanningConfig(costPlanOptimizerService, CostPlanningFormatter) {
  costPlanOptimizerService.pushPostprocessor(plan => {
    if (plan.service_settings_type === 'DigitalOcean' && plan.optimized_presets) {
      angular.forEach(plan.optimized_presets, preset => {
        preset.flavor = preset.size;
      });
      plan.details = CostPlanningFormatter.formatPresets(plan);
    }
    return plan;
  });
}
