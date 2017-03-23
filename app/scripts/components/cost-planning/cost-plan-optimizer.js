import template from './cost-plan-optimizer.html';

const costPlanOptimizer = {
  template,
  bindings: {
    services: '<',
  },
  controller: class ComponentController {
    explainPlan(plan) {
      plan.expanded = !plan.expanded;
    }
  }
};

export default costPlanOptimizer;
