import { templateParser } from '../utils';

// @ngInject
export default function costPlanningConfig(costPlanOptimizerService, $filter) {
  costPlanOptimizerService.pushPostprocessor(plan => {
    if (plan.package_template) {
      const template = templateParser(plan.package_template);
      plan.details = $filter('formatPackage')(template);
    }
    return plan;
  });
}
