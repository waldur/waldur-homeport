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
    $onInit() {
      this.hasHelp = HelpRegistry.hasItem(this.type, this.name);
    }
  }
};

export default helpLink;
