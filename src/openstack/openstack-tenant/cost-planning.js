import { templateParser } from '../utils';

// @ngInject
export default function costPlanningConfig(costPlanOptimizerService, $filter) {
  costPlanOptimizerService.pushPostprocessor(plan => {
    if (plan.service_settings_type === 'OpenStack' && plan.package_template) {
      const template = templateParser(plan.package_template);
      plan.details = $filter('formatPackage')(template);
    }

    if (plan.service_settings_type === 'OpenStackTenant' && plan.optimized_presets) {
      angular.forEach(plan.optimized_presets, item => {
        item.preset.disk = item.preset.storage;
      });
    }

    return plan;
  });
}
