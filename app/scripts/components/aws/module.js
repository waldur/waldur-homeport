import './help';
import './provider';

export default module => {
  module.run(costPlanningConfig);
};

// @ngInject
function costPlanningConfig(costPlanOptimizerService) {
  costPlanOptimizerService.pushPostprocessor(plan => {
    if (plan.service_settings_type === 'Amazon' && plan.optimized_presets) {
      angular.forEach(plan.optimized_presets, item => {
        item.flavor = item.size;
        item.preset.disk = item.preset.storage;
      });
    }
    return plan;
  });
}
