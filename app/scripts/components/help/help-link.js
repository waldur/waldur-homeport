import template from './help-link.html';
import HelpRegistry from './help-registry';

const helpLink = {
  template: template,
  transclude: true,
  bindings: {
    urlData: '<'
  },
  controller: class HelpListController {
    // @ngInject
    constructor() {
      this.hasHelp = false;
    }

    $onInit() {
      const {type = null, name = null} = this.urlData;
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
