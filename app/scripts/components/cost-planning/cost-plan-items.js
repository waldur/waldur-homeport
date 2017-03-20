import template from './cost-plan-items.html';

const costPlanItems = {
  template,
  bindings: {
    items: '<',
    presets: '<',
    onDelete: '&',
    onAdd: '&',
  }
};

export default costPlanItems;
