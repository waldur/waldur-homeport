import template from './cost-plan-optimizer.html';

const costPlanOptimizer = {
  template,
  bindings: {
    valid: '<',
    loading: '<',
    services: '<',
    refresh: '&',
  }
};

export default costPlanOptimizer;
