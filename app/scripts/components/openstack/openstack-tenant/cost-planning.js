import { templateParser } from '../utils';

// @ngInject
export default function costPlanningConfig(
  costPlanOptimizerService,
  $filter,
  CostPlanningFormatter) {
  costPlanOptimizerService.pushPostprocessor(plan => {
    if (plan.service_settings_type === 'OpenStack' && plan.package_template) {
      const template = templateParser(plan.package_template);
      plan.details = $filter('formatPackage')(template);
    }

    if (plan.service_settings_type === 'OpenStackTenant' && plan.optimized_presets) {
      plan.details = CostPlanningFormatter.formatPresets(plan);
    }

    return plan;
  });
}
