// @ngInject
export default function costPlanningConfig(costPlanOptimizerService) {
  costPlanOptimizerService.pushPostprocessor(plan => {
    if (plan.service_settings_type === 'DigitalOcean' && plan.optimized_presets) {
      angular.forEach(plan.optimized_presets, item => {
        item.flavor = item.size;
        item.preset.disk = item.preset.storage;
      });
    }
    return plan;
  });
}
