import template from './cost-plan-items.html';

const costPlanItems = {
  template,
  bindings: {
    items: '<',
    presets: '<',
    onDelete: '&',
    onAdd: '&',
  },
  controller: class ComponentController {
    getFreePresets(current_choice) {
      let used_choices = {};
      angular.forEach(this.items, item => {
        if (item.preset && item.preset !== current_choice) {
          used_choices[item.preset.url] = true;
        }
      });
      return this.presets.filter(preset => !used_choices[preset.url]);
    }
  }
};

export default costPlanItems;
