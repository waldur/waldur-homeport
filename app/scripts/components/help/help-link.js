import template from './help-link.html';
import HelpRegistry from './help-registry';

const helpLink = {
  template: template,
  transclude: true,
  bindings: {
    type: '<',
    name: '<',
  },
  controller: class HelpListController {
    // @ngInject
    constructor() {
      this.hasHelp = false;
    }

    $onInit() {
      const {type, name} = this;
      const helpData = HelpRegistry.get();
      const helpItems = helpData[type] && helpData[type].helpItems;
      if (!helpItems) return;

      for (const item of helpItems) {
        if (item.key !== name) continue;
        this.hasHelp = true;
        return;
      }
    }
  }
};

export default helpLink;
